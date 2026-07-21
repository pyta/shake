import { serializeBoardDocument } from './board-document.serializer';

describe('serializeBoardDocument', () => {
  it('builds a tree from root → column → children with LogicExpr', () => {
    const payload = serializeBoardDocument({
      boardId: '1',
      boardName: 'Demo',
      nodes: [
        {
          id: '1',
          catalogSlug: 'root',
          catalogNodeVersionId: '10',
          value: null,
          props: {},
          sockets: [
            {
              id: '100',
              nodeId: '1',
              name: 'output-root-children',
              type: 'output',
            },
          ],
        },
        {
          id: '2',
          catalogSlug: 'column',
          catalogNodeVersionId: '20',
          value: null,
          props: { type: 'main' },
          sockets: [
            {
              id: '200',
              nodeId: '2',
              name: 'input-column-id',
              type: 'input',
            },
            {
              id: '201',
              nodeId: '2',
              name: 'output-column-children',
              type: 'output',
            },
            {
              id: '202',
              nodeId: '2',
              name: 'output-column-visible',
              type: 'output',
            },
            {
              id: '203',
              nodeId: '2',
              name: 'output-column-enabled',
              type: 'output',
            },
          ],
        },
        {
          id: '3',
          catalogSlug: 'tile',
          catalogNodeVersionId: '30',
          value: null,
          props: { value: 'a', property: 'p' },
          sockets: [
            {
              id: '300',
              nodeId: '3',
              name: 'input-tile-id',
              type: 'input',
            },
            {
              id: '301',
              nodeId: '3',
              name: 'output-tile-visible',
              type: 'output',
            },
            {
              id: '302',
              nodeId: '3',
              name: 'output-tile-enabled',
              type: 'output',
            },
          ],
        },
        {
          id: '4',
          catalogSlug: 'selected',
          catalogNodeVersionId: '40',
          value: null,
          props: {},
          sockets: [
            {
              id: '400',
              nodeId: '4',
              name: 'input-selected-id',
              type: 'input',
            },
            {
              id: '401',
              nodeId: '4',
              name: 'output-selected-tile',
              type: 'output',
            },
          ],
        },
        {
          id: '5',
          catalogSlug: 'tile',
          catalogNodeVersionId: '30',
          value: null,
          props: { value: 'sel', property: 's' },
          sockets: [
            {
              id: '500',
              nodeId: '5',
              name: 'input-tile-id',
              type: 'input',
            },
          ],
        },
      ],
      connections: [
        {
          id: '10',
          fromNodeSocketId: '100',
          toNodeSocketId: '200',
          order: 0,
        },
        {
          id: '11',
          fromNodeSocketId: '201',
          toNodeSocketId: '300',
          order: 0,
        },
        {
          id: '12',
          fromNodeSocketId: '202',
          toNodeSocketId: '400',
          order: 0,
        },
        {
          id: '13',
          fromNodeSocketId: '401',
          toNodeSocketId: '500',
          order: 0,
        },
      ],
    });

    expect(payload.tree.slug).toBe('column');
    expect(payload.tree.children).toHaveLength(1);
    expect(payload.tree.children[0].slug).toBe('tile');
    expect(payload.tree.isVisible).toEqual({
      op: 'selected',
      nodeId: 4,
      tileNodeId: 5,
    });
    expect(payload.tree.isEnabled).toBeNull();
    expect(payload.tree.children[0].isVisible).toBeNull();
  });

  it('rejects boards without a single root', () => {
    expect(() =>
      serializeBoardDocument({
        boardId: '1',
        boardName: 'x',
        nodes: [],
        connections: [],
      }),
    ).toThrow(/exactly one root/);
  });
});
