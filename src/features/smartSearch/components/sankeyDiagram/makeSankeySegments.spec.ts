import { describe, expect, it } from '@jest/globals';

import makeSankeySegments from './makeSankeySegments';
import { FILTER_TYPE, OPERATION } from '../types';
import { SankeySegment, SEGMENT_KIND, SEGMENT_STYLE } from './types';

describe('makeSankeySegments()', () => {
  it('returns entry and exit for empty list', () => {
    const result = makeSankeySegments([]);
    expect(result).toEqual(<SankeySegment[]>[
      {
        kind: SEGMENT_KIND.EMPTY,
      },
      {
        kind: SEGMENT_KIND.EMPTY,
      },
    ]);
  });

  it('treats non-all as empty start', () => {
    const result = makeSankeySegments([
      {
        change: 200,
        filter: {
          config: {},
          op: OPERATION.ADD,
          type: FILTER_TYPE.CALL_BLOCKED,
        },
        matches: 200,
        result: 200,
      },
    ]);

    expect(result).toEqual(<SankeySegment[]>[
      {
        kind: SEGMENT_KIND.EMPTY,
      },
      {
        kind: SEGMENT_KIND.PSEUDO_ADD,
        main: null,
        side: {
          style: SEGMENT_STYLE.FILL,
          width: 1.0,
        },
      },
      {
        kind: SEGMENT_KIND.EXIT,
        style: SEGMENT_STYLE.FILL,
        width: 1.0,
      },
    ]);
  });

  it('treats all as non-empty entry', () => {
    const result = makeSankeySegments([
      {
        change: 200,
        filter: {
          config: {},
          op: OPERATION.ADD,
          type: FILTER_TYPE.ALL,
        },
        matches: 200,
        result: 200,
      },
    ]);

    expect(result).toEqual(<SankeySegment[]>[
      {
        kind: SEGMENT_KIND.ENTRY,
        style: SEGMENT_STYLE.FILL,
        width: 1,
      },
      {
        kind: SEGMENT_KIND.EXIT,
        style: SEGMENT_STYLE.FILL,
        width: 1,
      },
    ]);
  });

  it('handles a sub after an entry', () => {
    const result = makeSankeySegments([
      {
        change: 200,
        filter: {
          config: {},
          op: OPERATION.ADD,
          type: FILTER_TYPE.ALL,
        },
        matches: 200,
        result: 200,
      },
      {
        change: -50,
        filter: {
          config: {},
          op: OPERATION.SUB,
          type: FILTER_TYPE.PERSON_DATA,
        },
        matches: 100,
        result: 150,
      },
    ]);

    expect(result).toEqual(<SankeySegment[]>[
      {
        kind: SEGMENT_KIND.ENTRY,
        style: SEGMENT_STYLE.FILL,
        width: 1,
      },
      {
        kind: SEGMENT_KIND.SUB,
        main: {
          style: SEGMENT_STYLE.FILL,
          width: 0.75,
        },
        side: {
          style: SEGMENT_STYLE.FILL,
          width: 0.25,
        },
      },
      {
        kind: SEGMENT_KIND.EXIT,
        style: SEGMENT_STYLE.FILL,
        width: 0.75,
      },
    ]);
  });

  it('handles adding to already full stream', () => {
    const result = makeSankeySegments([
      {
        change: 100,
        filter: {
          config: {},
          op: OPERATION.ADD,
          type: FILTER_TYPE.ALL,
        },
        matches: 100,
        result: 100,
      },
      {
        change: -20,
        filter: {
          config: {},
          op: OPERATION.SUB,
          type: FILTER_TYPE.PERSON_TAGS,
        },
        matches: 20,
        result: 80,
      },
      {
        change: 0,
        filter: {
          config: {},
          op: OPERATION.ADD,
          type: FILTER_TYPE.CAMPAIGN_PARTICIPATION,
        },
        matches: 5,
        result: 80,
      },
      {
        change: 0,
        filter: {
          config: {},
          op: OPERATION.ADD,
          type: FILTER_TYPE.CALL_HISTORY,
        },
        matches: 10,
        result: 80,
      },
    ]);

    expect(result).toEqual(<SankeySegment[]>[
      {
        kind: SEGMENT_KIND.ENTRY,
        style: SEGMENT_STYLE.FILL,
        width: 1,
      },
      {
        kind: SEGMENT_KIND.SUB,
        main: {
          style: SEGMENT_STYLE.FILL,
          width: 0.8,
        },
        side: {
          style: SEGMENT_STYLE.FILL,
          width: 0.2,
        },
      },
      {
        kind: SEGMENT_KIND.PSEUDO_ADD,
        main: {
          style: SEGMENT_STYLE.FILL,
          width: 0.8,
        },
        side: {
          style: SEGMENT_STYLE.STROKE,
          width: 0.8,
        },
      },
      {
        kind: SEGMENT_KIND.PSEUDO_ADD,
        main: {
          style: SEGMENT_STYLE.FILL,
          width: 0.8,
        },
        side: {
          style: SEGMENT_STYLE.STROKE,
          width: 0.8,
        },
      },
      {
        kind: SEGMENT_KIND.EXIT,
        style: SEGMENT_STYLE.FILL,
        width: 0.8,
      },
    ]);
  });

  it('handles pseudo-removing', () => {
    const result = makeSankeySegments([
      {
        change: 100,
        filter: {
          config: {},
          op: OPERATION.ADD,
          type: FILTER_TYPE.ALL,
        },
        matches: 100,
        result: 100,
      },
      {
        change: -20,
        filter: {
          config: {},
          op: OPERATION.SUB,
          type: FILTER_TYPE.PERSON_TAGS,
        },
        matches: 20,
        result: 80,
      },
      {
        change: 0,
        filter: {
          config: {},
          op: OPERATION.SUB,
          type: FILTER_TYPE.CAMPAIGN_PARTICIPATION,
        },
        matches: 5,
        result: 80,
      },
    ]);

    expect(result).toEqual(<SankeySegment[]>[
      {
        kind: SEGMENT_KIND.ENTRY,
        style: SEGMENT_STYLE.FILL,
        width: 1,
      },
      {
        kind: SEGMENT_KIND.SUB,
        main: {
          style: SEGMENT_STYLE.FILL,
          width: 0.8,
        },
        side: {
          style: SEGMENT_STYLE.FILL,
          width: 0.2,
        },
      },
      {
        kind: SEGMENT_KIND.PSEUDO_SUB,
        main: {
          style: SEGMENT_STYLE.FILL,
          width: 0.8,
        },
        side: {
          style: SEGMENT_STYLE.STROKE,
          width: 0.8,
        },
      },
      {
        kind: SEGMENT_KIND.EXIT,
        style: SEGMENT_STYLE.FILL,
        width: 0.8,
      },
    ]);
  });
});