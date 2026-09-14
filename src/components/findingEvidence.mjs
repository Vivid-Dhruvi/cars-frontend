const normalizeId = (id) => String(id ?? '').replace(/\D/g, '').replace(/^0+/, '');

export function getFindingEvidence(finding, photos = {}) {
  const entries = Object.entries(photos || {});
  const photoFor = (id) => {
    const normalized = normalizeId(id);
    if (!normalized) return null;
    const photo = entries.find(([key]) => normalizeId(key) === normalized)?.[1];
    const src = typeof photo === 'string' ? photo : photo?.url;
    return typeof src === 'string' && src ? src : null;
  };
  for (const evidence of finding?.bounding_boxes || []) {
    const src = photoFor(evidence.image_id);
    const box = evidence.box;
    if (src && Array.isArray(box) && box.length === 4 &&
        box.every(value => Number.isFinite(value) && value >= 0 && value <= 1000) &&
        box[2] > box[0] && box[3] > box[1]) {
      return { src, box, imageId: evidence.image_id };
    }
  }
  for (const id of finding?.supporting_images || []) {
    const src = photoFor(id);
    if (src) return { src, box: null, imageId: id };
  }
  return { src: null, box: null, imageId: null };
}
