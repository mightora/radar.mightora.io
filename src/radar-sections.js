// Categories retain equal wedges; each wedge is split equally among its own subcategories.
export function radarSections(rows, cx, cy, radius, escapeHtml, textSize = 11) {
  const groups = new Map();
  rows.forEach(row => {
    if (!groups.has(row[1])) groups.set(row[1], new Set());
    groups.get(row[1]).add(row[2]);
  });
  const positions = new Map(), paths = [], labels = [], lines = [], bands = [];
  const point = (r, angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  const arc = (r, start, end, reverse = false) => {
    const from = point(r, reverse ? end : start), to = point(r, reverse ? start : end);
    return `M ${from.join(' ')} A ${r} ${r} 0 ${end - start > Math.PI ? 1 : 0} ${reverse ? 0 : 1} ${to.join(' ')}`;
  };
  const line = (angle, r, category) => {
    const [x, y] = point(r, angle);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="${category ? 'category-divider' : 'subcategory-divider'}" stroke="${category ? '#627d98' : '#829ab1'}" stroke-width="${category ? 1.8 : 1}"${category ? '' : ' stroke-dasharray="4 4"'}/>`;
  };
  function label(text, start, end, r, kind, index) {
    // Reverse bottom arcs to keep their lettering upright; cap a full circle short of 2π.
    const gap = Math.min(.035, (end - start) * .08), middle = (start + end) / 2;
    const bottom = Math.sin(middle) > .001;
    const id = `radar-${kind}-arc-${index}`;
    const labelRadius = r + (bottom ? 7 : 0);
    const available = (end - start - 2 * gap) * labelRadius;
    const size = kind === 'category' ? textSize : textSize * 10 / 11;
    const estimated = [...text].length * size * .65;
    const fit = estimated > available ? ` textLength="${available}" lengthAdjust="spacingAndGlyphs"` : '';
    paths.push(`<path id="${id}" d="${arc(labelRadius, start + gap, end - gap, bottom)}"/>`);
    labels.push(`<text class="${kind}-label" font-family="Manrope,sans-serif" font-size="${size}" font-weight="${kind === 'category' ? 700 : 600}" fill="#102a43" text-anchor="middle"><textPath href="#${id}" startOffset="50%"${fit}>${escapeHtml(text)}</textPath></text>`);
  }
  const angle = Math.PI * 2 / Math.max(groups.size, 1);
  [...groups].forEach(([category, subcategories], categoryIndex) => {
    const start = -Math.PI / 2 + categoryIndex * angle, end = start + angle;
    const subsectorAngle = angle / subcategories.size;
    const categoryPositions = new Map(); positions.set(category, categoryPositions);
    const bandStart = start + .002, bandEnd = end - .002;
    const innerEnd = point(radius + 35, bandEnd), innerStart = point(radius + 35, bandStart);
    bands.push(`<path class="category-band" d="${arc(radius + 60, bandStart, bandEnd)} L ${innerEnd.join(' ')} A ${radius + 35} ${radius + 35} 0 ${bandEnd - bandStart > Math.PI ? 1 : 0} 0 ${innerStart.join(' ')} Z" fill="none" stroke="#d9e2ec"/>`);
    if (groups.size > 1) lines.push(line(start, radius + 60, true));
    label(category, start, end, radius + 44, 'category', categoryIndex);
    [...subcategories].forEach((subcategory, index) => {
      const subStart = start + index * subsectorAngle;
      categoryPositions.set(subcategory, { start: subStart, angle: subsectorAngle });
      if (index > 0 || (groups.size === 1 && subcategories.size > 1)) lines.push(line(subStart, radius + 33, false));
      label(subcategory, subStart, subStart + subsectorAngle, radius + 19, 'subcategory', `${categoryIndex}-${index}`);
    });
  });
  return { positions, svg: `<defs>${paths.join('')}</defs>${bands.join('')}${lines.join('')}${labels.join('')}` };
}

export function wrapRadarLabel(text, textSize, measure) {
  const limit = textSize * 12, lines = [];
  String(text).split(/\r?\n/).forEach(paragraph => {
    let line = '';
    for (const character of paragraph) {
      if (line && measure(line + character) > limit) {
        const space = line.lastIndexOf(' ');
        if (space > 0) { lines.push(line.slice(0, space)); line = line.slice(space + 1); }
        else { lines.push(line); line = ''; }
      }
      line += character;
    }
    lines.push(line.trim());
  });
  return { lines, width: Math.max(...lines.map(measure)) + 6, height: lines.length * textSize * 1.3 + 6 };
}

export function radarPoints(rows, rings, positions, labels, initialRadius = 250) {
  const overlaps = (first, second) => first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
  let result;
  for (let attempt = 0; attempt < 9; attempt += 1) {
    const radius = Math.max(initialRadius, rings.length * 24) * 1.25 ** attempt, step = radius / rings.length;
    const occupied = [], points = [];
    let collisions = 0;
    rows.forEach((row, index) => {
      const foundRing = rings.findIndex(ring => ring.label === row[4]);
      const ring = foundRing < 0 ? rings.length - 1 : foundRing;
      const section = positions.get(row[1]).get(row[2]);
      const inner = radius - (ring + 1) * step + 10, outer = radius - ring * step - 10;
      const label = labels[index];
      let best;
      for (let distance = outer; distance >= Math.max(inner, 10); distance -= 10) {
        const margin = Math.min(section.angle / 2, 10 / distance);
        const count = Math.max(1, Math.ceil((section.angle - 2 * margin) * distance / 10));
        for (let slot = 0; slot <= count; slot += 1) {
          const angle = section.start + margin + (section.angle - 2 * margin) * slot / count;
          const x = Math.cos(angle) * distance, y = Math.sin(angle) * distance;
          const dotBox = { left: x - 10, right: x + 10, top: y - 10, bottom: y + 10 };
          const alternatives = label.width ? [
            { left: x + 13, top: y - label.height / 2 },
            { left: x - 13 - label.width, top: y - label.height / 2 },
            { left: x - label.width / 2, top: y + 13 },
            { left: x - label.width / 2, top: y - 13 - label.height }
          ] : [{ left: x, top: y }];
          for (const alternative of alternatives) {
            const labelBox = { ...alternative, right: alternative.left + label.width, bottom: alternative.top + label.height };
            const boxes = label.width ? [dotBox, labelBox] : [dotBox];
            const outside = label.width && [labelBox.left, labelBox.right].some(horizontal => [labelBox.top, labelBox.bottom].some(vertical => Math.hypot(horizontal, vertical) > radius - 10));
            const score = Number(outside) + occupied.reduce((total, box) => total + boxes.filter(candidate => overlaps(candidate, box)).length, 0);
            if (!best || score < best.score) best = { x, y, labelX: alternative.left + 3, labelY: alternative.top + 3, boxes, score };
            if (!score) break;
          }
          if (!best.score) break;
        }
        if (best && !best.score) break;
      }
      occupied.push(...best.boxes);
      collisions += best.score;
      points.push(best);
    });
    result = { radius, points, collisions };
    if (!collisions) return result;
  }
  return result;
}
