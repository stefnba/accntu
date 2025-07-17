import React, { useState } from 'react';
import { SortableTree, VirtualizedTree, type TreeItems } from '../index';

const DEMO_ITEMS: TreeItems = [
  {
    id: 'Documents',
    children: [
      {
        id: 'Personal',
        children: [
          { id: 'Resume.pdf', children: [] },
          { id: 'Cover Letter.docx', children: [] },
        ],
      },
      {
        id: 'Work',
        children: [
          { id: 'Project A', children: [] },
          { id: 'Project B', children: [] },
        ],
      },
    ],
  },
  {
    id: 'Images',
    children: [
      { id: 'Vacation Photos', children: [] },
      { id: 'Screenshots', children: [] },
    ],
  },
  {
    id: 'Downloads',
    children: [],
  },
];

// Generate large dataset for virtualization demo
const generateLargeTree = (depth: number, breadth: number): TreeItems => {
  const items: TreeItems = [];
  
  for (let i = 0; i < breadth; i++) {
    const item = {
      id: `item-${depth}-${i}`,
      children: depth > 0 ? generateLargeTree(depth - 1, breadth) : [],
    };
    items.push(item);
  }
  
  return items;
};

const LARGE_TREE = generateLargeTree(3, 50); // 50 items at each level, 3 levels deep

export const BasicTreeExample = () => {
  const [items, setItems] = useState<TreeItems>(DEMO_ITEMS);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Basic Sortable Tree</h2>
      
      <SortableTree
        defaultItems={items}
        onItemsChange={setItems}
        collapsible
        removable
        indicator
        indentationWidth={30}
      />
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Current Tree Structure:</h3>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(items, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const VirtualizedTreeExample = () => {
  const [items, setItems] = useState<TreeItems>(LARGE_TREE);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Virtualized Tree (Large Dataset)</h2>
      
      <div className="mb-4 text-sm text-gray-600">
        This tree contains {LARGE_TREE.length} root items with nested children.
        Only visible items are rendered for optimal performance.
      </div>
      
      <VirtualizedTree
        defaultItems={items}
        onItemsChange={setItems}
        maxHeight={600}
        itemHeight={45}
        collapsible
        removable
        indentationWidth={25}
      />
      
      <div className="mt-4 text-sm text-gray-500">
        Total items: {JSON.stringify(items).match(/id/g)?.length || 0}
      </div>
    </div>
  );
};

export const CustomizedTreeExample = () => {
  const [items, setItems] = useState<TreeItems>(DEMO_ITEMS);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Customized Tree</h2>
      
      <SortableTree
        defaultItems={items}
        onItemsChange={setItems}
        collapsible
        removable
        indicator
        indentationWidth={60}
      />
      
      <div className="mt-6 space-y-2">
        <button
          onClick={() => setItems(DEMO_ITEMS)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset Tree
        </button>
        
        <button
          onClick={() => setItems([])}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export const StoreIntegrationExample = () => {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Store Integration</h2>
      
      <div className="mb-4 text-sm text-gray-600">
        This example shows how to use the Zustand store directly
        for advanced tree management.
      </div>
      
      <SortableTree
        defaultItems={DEMO_ITEMS}
        collapsible
        removable
      />
    </div>
  );
};