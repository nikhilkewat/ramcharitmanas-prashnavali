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

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.length ? lines : [text];
}

export async function generateResultImage(
  chaupai: Chaupai,
  question?: string
): Promise<Blob> {
  const W = 800;
  const H = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#1a0f05');
  bgGrad.addColorStop(0.5, '#451a03');
  bgGrad.addColorStop(1, '#1a0f05');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.3;
  roundRect(ctx, 20, 20, W - 40, H - 40, 16);
  ctx.stroke();
  ctx.lineWidth = 1;
  roundRect(ctx, 30, 30, W - 60, H - 60, 12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.font = '200px serif';
  ctx.fillStyle = '#d97706';
  ctx.globalAlpha = 0.06;
  ctx.textAlign = 'center';
  ctx.fillText('\u0950', W / 2, 220);
  ctx.globalAlpha = 1;

  ctx.font = 'bold 48px serif';
  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'center';
  ctx.fillText('\u0936\u094D\u0930\u0940 \u0930\u093E\u092E \u092A\u094D\u0930\u0936\u094D\u0928\u093E\u0935\u0932\u0940', W / 2, 120);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('Ram Prashnavali', W / 2, 155);

  ctx.strokeStyle = '#d97706';
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 175);
  ctx.lineTo(W - 100, 175);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const badgeColor = chaupai.result === '\u0936\u0941\u092D' ? '#065f46' : chaupai.result === '\u0905\u0936\u0941\u092D' ? '#92400e' : '#3730a3';
  const badgeBg = chaupai.result === '\u0936\u0941\u092D' ? '#d1fae5' : chaupai.result === '\u0905\u0936\u0941\u092D' ? '#fef3c7' : '#e0e7ff';
  const badgeText = chaupai.resultLabel + ' \u00B7 ' + chaupai.resultLabelEn;
  ctx.font = 'bold 22px sans-serif';
  const badgeWidth = ctx.measureText(badgeText).width + 40;
  const badgeX = (W - badgeWidth) / 2;

  ctx.fillStyle = badgeBg;
  roundRect(ctx, badgeX, 200, badgeWidth, 40, 20);
  ctx.fill();
  ctx.fillStyle = badgeColor;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, W / 2, 227);

  let yOffset = 280;
  if (question) {
    ctx.font = 'italic 20px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.globalAlpha = 0.8;
    ctx.fillText('\u201C' + question + '\u201D', W / 2, yOffset);
    ctx.globalAlpha = 1;
    yOffset += 40;
  }

  const cardY = yOffset;
  const cardH = 260;
  ctx.fillStyle = 'rgba(254, 243, 199, 0.08)';
  roundRect(ctx, 60, cardY, W - 120, cardH, 12);
  ctx.fill();

  ctx.fillStyle = '#d97706';
  roundRect(ctx, 60, cardY, 6, cardH, 3);
  ctx.fill();

  ctx.font = '30px serif';
  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'center';
  const lines = wrapText(chaupai.hindi, 25);
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, cardY + 55 + i * 42);
  });

  const meaningY = cardY + 55 + lines.length * 42 + 20;
  ctx.font = 'italic 18px sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.globalAlpha = 0.8;
  const mLines = wrapText(chaupai.meaning, 40);
  mLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, meaningY + i * 26);
  });
  ctx.globalAlpha = 1;

  const detailsY = cardY + cardH + 40;
  const drawDetail = (y: number, icon: string, label: string, value: string) => {
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.textAlign = 'left';
    ctx.fillText(icon + ' ' + label, 80, y);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#fde68a';
    ctx.globalAlpha = 0.9;
    ctx.fillText(value, 80, y + 24);
    ctx.globalAlpha = 1;
    return y + 56;
  };

  let dy = detailsY;
  dy = drawDetail(dy, '\uD83D\uDCD6', 'Episode', chaupai.episodeHi);
  dy = drawDetail(dy, '\uD83D\uDCDA', 'Kand', chaupai.kandHi + ' (' + chaupai.kand + ')');
  dy = drawDetail(dy, '\uD83C\uDF93', 'Lesson', chaupai.lessonHi);
  dy = drawDetail(dy, '\uD83D\uDCA1', 'Inference', chaupai.inferenceHi);

  ctx.strokeStyle = '#d97706';
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, H - 120);
  ctx.lineTo(W - 100, H - 120);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.font = '18px serif';
  ctx.fillStyle = '#92400e';
  ctx.textAlign = 'center';
  ctx.fillText('\u0936\u094D\u0930\u0940\u0930\u093E\u092E\u091A\u0930\u093F\u0924\u092E\u093E\u0928\u0938 \u00B7 \u0917\u094B\u0938\u094D\u0935\u093E\u092E\u0940 \u0924\u0941\u0932\u0938\u0940\u0926\u093E\u0938', W / 2, H - 85);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#6b4e17';
  ctx.fillText('ramcharitmanas.vercel.app', W / 2, H - 55);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
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
