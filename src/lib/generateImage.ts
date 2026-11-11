import { Chaupai } from '@/data/chaupais';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Split into user-perceived characters so a Devanagari conjunct is never cut.
function graphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Word-wraps by measured pixel width with the context's current font. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = current ? current + ' ' + word : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    // A single word wider than the line: break it by character.
    if (ctx.measureText(word).width > maxWidth) {
      let part = '';
      for (const g of graphemes(word)) {
        if (part && ctx.measureText(part + g).width > maxWidth) {
          lines.push(part);
          part = g;
        } else {
          part += g;
        }
      }
      current = part;
    } else {
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

/** Caps a wrapped block at maxLines, ending the last kept line with "…". */
function clampLines(ctx: CanvasRenderingContext2D, lines: string[], maxLines: number, maxWidth: number): string[] {
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && ctx.measureText(last + '…').width > maxWidth) last = graphemes(last).slice(0, -1).join('');
  kept[maxLines - 1] = last.trimEnd() + '…';
  return kept;
}

// Use the same faces as the page (next/font exposes them as CSS variables)
// and make sure the Devanagari glyphs are loaded before drawing.
async function resolveFonts(sample: string) {
  const css = getComputedStyle(document.documentElement);
  const display = css.getPropertyValue('--font-tiro').trim() || 'serif';
  const sans = css.getPropertyValue('--font-mukta').trim() || 'sans-serif';
  try {
    await Promise.all([
      document.fonts.load(`30px ${display}`, sample),
      document.fonts.load(`16px ${sans}`, sample),
      document.fonts.load(`bold 16px ${sans}`, sample),
    ]);
  } catch {
    // Fall back to whatever is available.
  }
  return { display, sans };
}

const W = 800;
const MIN_H = 1100;
const TEXT_W = W - 160; // content column: x 80 → 720
const VERSE_W = W - 200; // inside the verse card

export async function generateResultImage(
  chaupai: Chaupai,
  question?: string
): Promise<Blob> {
  const { display, sans } = await resolveFonts(chaupai.hindi + chaupai.lessonHi);
  const F = {
    om: `200px ${display}`,
    title: `48px ${display}`,
    subtitle: `24px ${sans}`,
    badge: `bold 22px ${sans}`,
    question: `italic 20px ${sans}`,
    verse: `32px ${display}`,
    meaning: `italic 18px ${sans}`,
    label: `bold 16px ${sans}`,
    value: `17px ${sans}`,
    footer: `20px ${display}`,
    url: `14px ${sans}`,
  };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported');

  // ---- Measure: wrap every block, then size the canvas to fit ----
  const measure = (font: string, text: string, width: number) => {
    ctx.font = font;
    return wrapText(ctx, text, width);
  };

  ctx.font = F.question;
  const questionLines = question
    ? clampLines(ctx, wrapText(ctx, '“' + question + '”', TEXT_W), 3, TEXT_W)
    : [];
  // Break the verse at its dandas (। ॥) first, then wrap each half.
  const verseLines = chaupai.hindi
    .split(/(?<=[।॥])\s*/)
    .filter((s) => s.trim())
    .flatMap((half) => measure(F.verse, half, VERSE_W));
  const meaningLines = measure(F.meaning, chaupai.meaning, VERSE_W);
  const details = [
    { label: '📖 Episode · कथा', value: chaupai.episodeHi },
    { label: '📚 Kand · काण्ड', value: `${chaupai.kandHi} (${chaupai.kand})` },
    { label: '🎓 Lesson · शिक्षा', value: chaupai.lessonHi },
    { label: '💡 Guidance · निष्कर्ष', value: chaupai.inferenceHi },
  ].map((d) => ({ ...d, lines: measure(F.value, d.value, TEXT_W) }));

  const VERSE_LH = 50;
  const MEANING_LH = 27;
  const QUESTION_LH = 30;
  const VALUE_LH = 26;

  const questionY = 285;
  const cardY = questionY + (questionLines.length ? questionLines.length * QUESTION_LH + 10 : -10);
  const verseY = cardY + 58;
  const meaningY = verseY + (verseLines.length - 1) * VERSE_LH + 44;
  const cardH = meaningY + (meaningLines.length - 1) * MEANING_LH + 34 - cardY;

  let cursor = cardY + cardH + 52;
  const detailLayout = details.map((d) => {
    const y = cursor;
    cursor = y + 28 + (d.lines.length - 1) * VALUE_LH + 42;
    return { ...d, y };
  });
  const H = Math.max(MIN_H, cursor + 130);

  // Setting the size resets the context, so draw only after this point.
  canvas.width = W;
  canvas.height = H;

  // ---- Draw ----
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#1a0f05');
  bgGrad.addColorStop(0.5, '#451a03');
  bgGrad.addColorStop(1, '#1a0f05');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#d97706';
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 3;
  roundRect(ctx, 20, 20, W - 40, H - 40, 16);
  ctx.stroke();
  ctx.lineWidth = 1;
  roundRect(ctx, 30, 30, W - 60, H - 60, 12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.font = F.om;
  ctx.fillStyle = '#d97706';
  ctx.globalAlpha = 0.06;
  ctx.fillText('ॐ', W / 2, 220);
  ctx.globalAlpha = 1;

  ctx.font = F.title;
  ctx.fillStyle = '#fde68a';
  ctx.fillText('श्री राम प्रश्नावली', W / 2, 120);

  ctx.font = F.subtitle;
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('Ram Prashnavali', W / 2, 158);

  const rule = (y: number) => {
    ctx.strokeStyle = '#d97706';
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(W - 100, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  rule(178);

  const badgeColor = chaupai.result === 'शुभ' ? '#065f46' : chaupai.result === 'अशुभ' ? '#92400e' : '#3730a3';
  const badgeBg = chaupai.result === 'शुभ' ? '#d1fae5' : chaupai.result === 'अशुभ' ? '#fef3c7' : '#e0e7ff';
  ctx.font = F.badge;
  ctx.textBaseline = 'middle';
  const badgeText = chaupai.resultLabel + ' · ' + chaupai.resultLabelEn;
  const badgeWidth = Math.min(ctx.measureText(badgeText).width + 44, TEXT_W);
  ctx.fillStyle = badgeBg;
  roundRect(ctx, (W - badgeWidth) / 2, 202, badgeWidth, 42, 21);
  ctx.fill();
  ctx.fillStyle = badgeColor;
  ctx.fillText(badgeText, W / 2, 224, TEXT_W - 44);
  ctx.textBaseline = 'alphabetic';

  if (questionLines.length) {
    ctx.font = F.question;
    ctx.fillStyle = '#fbbf24';
    ctx.globalAlpha = 0.85;
    questionLines.forEach((line, i) => ctx.fillText(line, W / 2, questionY + i * QUESTION_LH));
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = 'rgba(254, 243, 199, 0.08)';
  roundRect(ctx, 60, cardY, W - 120, cardH, 12);
  ctx.fill();
  ctx.fillStyle = '#d97706';
  roundRect(ctx, 60, cardY, 6, cardH, 3);
  ctx.fill();

  ctx.font = F.verse;
  ctx.fillStyle = '#fde68a';
  verseLines.forEach((line, i) => ctx.fillText(line, W / 2, verseY + i * VERSE_LH));

  ctx.font = F.meaning;
  ctx.fillStyle = '#fbbf24';
  ctx.globalAlpha = 0.85;
  meaningLines.forEach((line, i) => ctx.fillText(line, W / 2, meaningY + i * MEANING_LH));
  ctx.globalAlpha = 1;

  ctx.textAlign = 'left';
  for (const d of detailLayout) {
    ctx.font = F.label;
    ctx.fillStyle = '#d97706';
    ctx.fillText(d.label, 80, d.y);
    ctx.font = F.value;
    ctx.fillStyle = '#fde68a';
    ctx.globalAlpha = 0.92;
    d.lines.forEach((line, i) => ctx.fillText(line, 80, d.y + 28 + i * VALUE_LH));
    ctx.globalAlpha = 1;
  }

  rule(H - 120);
  ctx.textAlign = 'center';
  ctx.font = F.footer;
  ctx.fillStyle = '#b45309';
  ctx.fillText('श्रीरामचरितमानस · गोस्वामी तुलसीदास', W / 2, H - 84);
  ctx.font = F.url;
  ctx.fillStyle = '#8a6420';
  ctx.fillText('ramcharitmanas.vercel.app', W / 2, H - 55);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png');
  });
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareImage(blob: Blob) {
  const file = new File([blob], 'ram-prashnavali.png', { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: '\u0936\u094D\u0930\u0940 \u0930\u093E\u092E \u092A\u094D\u0930\u0936\u094D\u0928\u093E\u0935\u0932\u0940',
      files: [file],
    });
  }
}
