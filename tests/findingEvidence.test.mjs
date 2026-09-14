import test from 'node:test';
import assert from 'node:assert/strict';
import { getFindingEvidence } from '../src/components/findingEvidence.mjs';

test('uses the photo belonging to a valid box, even when it is not the first supporting image', () => {
  const result = getFindingEvidence({ supporting_images: ['IMAGE_01', 'IMAGE_02'], bounding_boxes: [
    { image_id: 'IMAGE_02', box: [100, 200, 400, 700] }
  ] }, { '01': 'front.jpg', '02': { url: 'hood.jpg' } });
  assert.deepEqual(result, { src: 'hood.jpg', box: [100, 200, 400, 700], imageId: 'IMAGE_02' });
});

test('does not invent evidence from an unrelated uploaded photo', () => {
  assert.deepEqual(getFindingEvidence({ supporting_images: ['IMAGE_14'] }, { '01': 'front.jpg' }),
    { src: null, box: null, imageId: null });
});

test('invalid or reversed coordinates leave the matching photo unannotated', () => {
  for (const box of [[-1, 0, 200, 300], [100, 200, 50, 400], [0, 0, 1001, 20], ['0', 0, 20, 30]]) {
    const result = getFindingEvidence({ supporting_images: ['IMAGE_01'], bounding_boxes: [{ image_id: 'IMAGE_01', box }] }, { '1': 'front.jpg' });
    assert.equal(result.src, 'front.jpg');
    assert.equal(result.box, null);
  }
});

test('skips missing evidence and resolves padded and prefixed photo keys', () => {
  const result = getFindingEvidence({ bounding_boxes: [
    { image_id: 'IMAGE_01', box: [0, 0, 50, 50] },
    { image_id: '12', box: [20, 30, 800, 900] }
  ] }, { 'IMAGE_12': { url: 'wheel.jpg' } });
  assert.equal(result.src, 'wheel.jpg');
  assert.equal(result.imageId, '12');
});
