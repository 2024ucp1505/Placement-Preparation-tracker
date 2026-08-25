'use strict';

const DSA_DATA = {
  topics: [
    {
      id: "arrays",
      name: "Arrays",
      icon: "▦",
      color: "#6366f1",
      problems: [
        { id: "a1", name: "Two Sum", lc: "https://leetcode.com/problems/two-sum/", diff: "Easy", companies: ["Google", "Amazon", "Microsoft", "Meta"] },
        { id: "a2", name: "Best Time to Buy and Sell Stock", lc: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", diff: "Easy", companies: ["Amazon", "Microsoft", "Zoho", "Adobe"] },
        { id: "a3", name: "Maximum Subarray (Kadane's)", lc: "https://leetcode.com/problems/maximum-subarray/", diff: "Easy", companies: ["Microsoft", "Amazon", "Adobe"] },
        { id: "a4", name: "Product of Array Except Self", lc: "https://leetcode.com/problems/product-of-array-except-self/", diff: "Medium", companies: ["Amazon", "Meta", "Google"] },
        { id: "a5", name: "Find Duplicate Number", lc: "https://leetcode.com/problems/find-the-duplicate-number/", diff: "Medium", companies: ["Amazon", "Microsoft"] },
        { id: "a6", name: "Maximum Product Subarray", lc: "https://leetcode.com/problems/maximum-product-subarray/", diff: "Medium", companies: ["Flipkart", "Amazon", "Google"] },
        { id: "a7", name: "Find Minimum in Rotated Sorted Array", lc: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", diff: "Medium", companies: ["Google", "Microsoft", "Amazon"] },
        { id: "a8", name: "Search in Rotated Sorted Array", lc: "https://leetcode.com/problems/search-in-rotated-sorted-array/", diff: "Medium", companies: ["Flipkart", "Amazon", "Microsoft"] },
        { id: "a9", name: "3Sum", lc: "https://leetcode.com/problems/3sum/", diff: "Medium", companies: ["Amazon", "Microsoft", "Meta"] },
        { id: "a10", name: "Container With Most Water", lc: "https://leetcode.com/problems/container-with-most-water/", diff: "Medium", companies: ["Amazon", "Google", "Adobe"] },
        { id: "a11", name: "Trapping Rain Water", lc: "https://leetcode.com/problems/trapping-rain-water/", diff: "Hard", companies: ["Flipkart", "Amazon", "Microsoft"] },
        { id: "a12", name: "Merge Intervals", lc: "https://leetcode.com/problems/merge-intervals/", diff: "Medium", companies: ["Meta", "Google", "Amazon"] },
        { id: "a13", name: "Insert Interval", lc: "https://leetcode.com/problems/insert-interval/", diff: "Medium", companies: ["Google", "Microsoft"] },
        { id: "a14", name: "Non-overlapping Intervals", lc: "https://leetcode.com/problems/non-overlapping-intervals/", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "a15", name: "Set Matrix Zeroes", lc: "https://leetcode.com/problems/set-matrix-zeroes/", diff: "Medium", companies: ["Flipkart", "Adobe", "Microsoft"] },
        { id: "a16", name: "Spiral Matrix", lc: "https://leetcode.com/problems/spiral-matrix/", diff: "Medium", companies: ["Microsoft", "Amazon", "Adobe"] },
        { id: "a17", name: "Move All Zeroes to End", lc: "https://leetcode.com/problems/move-zeroes/", diff: "Easy", companies: ["Walmart", "Microsoft"] },
        { id: "a18", name: "Majority Element (Boyer-Moore)", lc: "https://leetcode.com/problems/majority-element/", diff: "Easy", companies: ["Microsoft", "Amazon", "Adobe"] },
        { id: "a19", name: "Kth Smallest Element", lc: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", diff: "Medium", companies: ["Microsoft", "Amazon"] },
        { id: "a20", name: "Subarrays with Sum K", lc: "https://leetcode.com/problems/subarray-sum-equals-k/", diff: "Medium", companies: ["Microsoft", "Amazon", "Google"] },
      ]
    },
    {
      id: "strings",
      name: "Strings",
      icon: "Aa",
      color: "#8b5cf6",
      problems: [
        { id: "s1", name: "Longest Substring Without Repeating Characters", lc: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", diff: "Medium", companies: ["Flipkart", "Amazon", "Google", "Microsoft"] },
        { id: "s2", name: "Longest Repeating Character Replacement", lc: "https://leetcode.com/problems/longest-repeating-character-replacement/", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "s3", name: "Minimum Window Substring", lc: "https://leetcode.com/problems/minimum-window-substring/", diff: "Hard", companies: ["Flipkart", "Atlassian", "Amazon", "Google"] },
        { id: "s4", name: "Valid Anagram", lc: "https://leetcode.com/problems/valid-anagram/", diff: "Easy", companies: ["Flipkart", "Amazon", "Adobe"] },
        { id: "s5", name: "Group Anagrams", lc: "https://leetcode.com/problems/group-anagrams/", diff: "Medium", companies: ["Amazon", "Google", "Adobe", "Microsoft"] },
        { id: "s6", name: "Valid Palindrome", lc: "https://leetcode.com/problems/valid-palindrome/", diff: "Easy", companies: ["Microsoft", "Amazon"] },
        { id: "s7", name: "Palindromic Substrings", lc: "https://leetcode.com/problems/palindromic-substrings/", diff: "Medium", companies: ["Microsoft", "Google", "Adobe"] },
        { id: "s8", name: "Longest Common Prefix", lc: "https://leetcode.com/problems/longest-common-prefix/", diff: "Easy", companies: ["Microsoft", "Google", "Amazon"] },
        { id: "s9", name: "Permutations of a String", lc: "https://leetcode.com/problems/permutations-in-string/", diff: "Medium", companies: ["Microsoft", "Amazon"] },
        { id: "s10", name: "Generate Parentheses", lc: "https://leetcode.com/problems/generate-parentheses/", diff: "Medium", companies: ["Google", "Amazon", "Microsoft"] },
        { id: "s11", name: "Longest Valid Parentheses", lc: "https://leetcode.com/problems/longest-valid-parentheses/", diff: "Hard", companies: ["Google", "Amazon"] },
        { id: "s12", name: "Decode Ways", lc: "https://leetcode.com/problems/decode-ways/", diff: "Medium", companies: ["Amazon", "Microsoft", "Adobe"] },
        { id: "s13", name: "Group Shifted String", lc: "https://leetcode.com/problems/group-shifted-strings/", diff: "Medium", companies: ["Google"] },
        { id: "s14", name: "Daily Temperatures (Monotonic Stack)", lc: "https://leetcode.com/problems/daily-temperatures/", diff: "Medium", companies: ["Flipkart", "Amazon"] },
      ]
    },
    {
      id: "linkedlist",
      name: "Linked List",
      icon: "⇝",
      color: "#ec4899",
      problems: [
        { id: "ll1", name: "Reverse a Linked List", lc: "https://leetcode.com/problems/reverse-linked-list/", diff: "Easy", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "ll2", name: "Detect Cycle in Linked List", lc: "https://leetcode.com/problems/linked-list-cycle/", diff: "Easy", companies: ["Amazon", "Microsoft", "Adobe"] },
        { id: "ll3", name: "Merge Two Sorted Lists", lc: "https://leetcode.com/problems/merge-two-sorted-lists/", diff: "Easy", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "ll4", name: "Merge K Sorted Lists", lc: "https://leetcode.com/problems/merge-k-sorted-lists/", diff: "Hard", companies: ["Oracle", "Amazon", "Microsoft"] },
        { id: "ll5", name: "Remove Nth Node From End", lc: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", diff: "Medium", companies: ["Amazon", "Microsoft"] },
        { id: "ll6", name: "Reorder List", lc: "https://leetcode.com/problems/reorder-list/", diff: "Medium", companies: ["Amazon", "Google"] },
        { id: "ll7", name: "Find Middle of Linked List", lc: "https://leetcode.com/problems/middle-of-the-linked-list/", diff: "Easy", companies: ["Amazon", "Microsoft"] },
        { id: "ll8", name: "Add Two Numbers (LL)", lc: "https://leetcode.com/problems/add-two-numbers/", diff: "Medium", companies: ["Google", "Amazon", "Microsoft"] },
        { id: "ll9", name: "LRU Cache", lc: "https://leetcode.com/problems/lru-cache/", diff: "Medium", companies: ["Uber", "Amazon", "Microsoft", "Google"] },
        { id: "ll10", name: "LFU Cache", lc: "https://leetcode.com/problems/lfu-cache/", diff: "Hard", companies: ["Amazon", "Microsoft"] },
        { id: "ll11", name: "Reverse Linked List in Groups of K", lc: "https://leetcode.com/problems/reverse-nodes-in-k-group/", diff: "Hard", companies: ["Adobe", "Amazon"] },
      ]
    },
    {
      id: "stackqueue",
      name: "Stack",
      icon: "⟂",
      color: "#f59e0b",
      problems: [
        { id: "sq1", name: "Valid Parentheses", lc: "https://leetcode.com/problems/valid-parentheses/", diff: "Easy", companies: ["Oracle", "Amazon", "Microsoft"] },
        { id: "sq2", name: "Implement Queue using Two Stacks", lc: "https://leetcode.com/problems/implement-queue-using-stacks/", diff: "Easy", companies: ["Morgan Stanley", "Amazon"] },
        { id: "sq3", name: "Min Stack", lc: "https://leetcode.com/problems/min-stack/", diff: "Medium", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "sq4", name: "Delete Middle Element of Stack", lc: "https://leetcode.com/problems/delete-the-middle-element-of-a-stack/", diff: "Medium", companies: ["Microsoft"] },
        { id: "sq5", name: "Redundant Parenthesis", lc: "https://www.geeksforgeeks.org/problems/redundant-parenthesis--170647/1", diff: "Medium", companies: ["Oracle", "Microsoft"] },
        { id: "sq6", name: "Largest Rectangle in Histogram", lc: "https://leetcode.com/problems/largest-rectangle-in-histogram/", diff: "Hard", companies: ["Amazon", "Google", "Microsoft"] },
        { id: "sq7", name: "Gas Station", lc: "https://leetcode.com/problems/gas-station/", diff: "Medium", companies: ["Amazon", "Google"] },
        { id: "sq8", name: "Find Median in a Stream", lc: "https://leetcode.com/problems/find-median-from-data-stream/", diff: "Hard", companies: ["Morgan Stanley", "Amazon", "Google"] },
      ]
    },
    {
      id: "trees",
      name: "Trees",
      icon: "🌳",
      color: "#10b981",
      problems: [
        { id: "t1", name: "Invert Binary Tree", lc: "https://leetcode.com/problems/invert-binary-tree/", diff: "Easy", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "t2", name: "Binary Tree Level Order Traversal (BFS)", lc: "https://leetcode.com/problems/binary-tree-level-order-traversal/", diff: "Medium", companies: ["Microsoft", "Amazon", "Google"] },
        { id: "t3", name: "Binary Tree Maximum Path Sum", lc: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", diff: "Hard", companies: ["Amazon", "Google"] },
        { id: "t4", name: "Serialize and Deserialize Binary Tree", lc: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", diff: "Hard", companies: ["Amazon", "Microsoft"] },
        { id: "t5", name: "Subtree of Another Tree", lc: "https://leetcode.com/problems/subtree-of-another-tree/", diff: "Easy", companies: ["Amazon", "Microsoft"] },
        { id: "t6", name: "Construct Binary Tree from Preorder + Inorder", lc: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "t7", name: "Validate Binary Search Tree", lc: "https://leetcode.com/problems/validate-binary-search-tree/", diff: "Medium", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "t8", name: "Kth Smallest in BST", lc: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", diff: "Medium", companies: ["Amazon", "Google", "Microsoft"] },
        { id: "t9", name: "Lowest Common Ancestor of BST", lc: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", diff: "Easy", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "t10", name: "Top View of Binary Tree", lc: "https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1", diff: "Medium", companies: ["Walmart", "Amazon", "Adobe"] },
        { id: "t11", name: "Left/Right View of Binary Tree", lc: "https://leetcode.com/problems/binary-tree-right-side-view/", diff: "Medium", companies: ["Samsung", "Microsoft", "Adobe"] },
        { id: "t12", name: "Tree Boundary Traversal", lc: "https://www.geeksforgeeks.org/problems/boundary-traversal-of-binary-tree/1", diff: "Medium", companies: ["Microsoft", "Samsung"] },
        { id: "t13", name: "Nodes at Given Distance in Binary Tree", lc: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/", diff: "Medium", companies: ["Walmart", "Amazon", "Google"] },
        { id: "t14", name: "Root to Leaf Path Sum", lc: "https://leetcode.com/problems/path-sum/", diff: "Easy", companies: ["Atlassian", "Amazon", "Microsoft"] },
        { id: "t15", name: "Top K Frequent Elements", lc: "https://leetcode.com/problems/top-k-frequent-elements/", diff: "Medium", companies: ["Microsoft", "Amazon", "Google"] },
        { id: "t16", name: "Implement Trie (Prefix Tree)", lc: "https://leetcode.com/problems/implement-trie-prefix-tree/", diff: "Medium", companies: ["Google", "Microsoft", "Amazon"] },
        { id: "t17", name: "Add and Search Word (Trie)", lc: "https://leetcode.com/problems/add-and-search-word-data-structure-design/", diff: "Medium", companies: ["Google", "Microsoft"] },
      ]
    },
    {
      id: "graphs",
      name: "Graphs",
      icon: "◎",
      color: "#3b82f6",
      problems: [
        { id: "g1", name: "Number of Islands (BFS/DFS)", lc: "https://leetcode.com/problems/number-of-islands/", diff: "Medium", companies: ["Walmart", "Amazon", "Google", "Microsoft"] },
        { id: "g2", name: "Flood Fill Algorithm", lc: "https://leetcode.com/problems/flood-fill/", diff: "Easy", companies: ["Google", "Microsoft", "Amazon"] },
        { id: "g3", name: "Detect Cycle in Directed Graph", lc: "https://leetcode.com/problems/course-schedule/", diff: "Medium", companies: ["Adobe", "Amazon", "Google"] },
        { id: "g4", name: "Topological Sorting (Course Schedule II)", lc: "https://leetcode.com/problems/course-schedule-ii/", diff: "Medium", companies: ["Amazon", "Google", "Microsoft"] },
        { id: "g5", name: "Is Graph Bipartite?", lc: "https://leetcode.com/problems/is-graph-bipartite/", diff: "Medium", companies: ["Samsung", "Google", "Amazon"] },
        { id: "g6", name: "Critical Connections (Bridges)", lc: "https://leetcode.com/problems/critical-connections-in-a-network/", diff: "Hard", companies: ["Amazon", "Google"] },
        { id: "g7", name: "Find Eventual Safe States", lc: "https://leetcode.com/problems/find-eventual-safe-states/", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "g8", name: "Rotten Oranges (Multi-source BFS)", lc: "https://leetcode.com/problems/rotting-oranges/", diff: "Medium", companies: ["Flipkart", "Amazon", "Microsoft"] },
        { id: "g9", name: "Pacific Atlantic Water Flow", lc: "https://leetcode.com/problems/pacific-atlantic-water-flow/", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "g10", name: "Alien Dictionary (Topological)", lc: "https://www.geeksforgeeks.org/problems/alien-dictionary/1", diff: "Hard", companies: ["Microsoft", "Google", "Amazon"] },
        { id: "g11", name: "Word Ladder I", lc: "https://leetcode.com/problems/word-ladder/", diff: "Hard", companies: ["Samsung", "Amazon", "Google"] },
        { id: "g12", name: "Word Ladder II", lc: "https://leetcode.com/problems/word-ladder-ii/", diff: "Hard", companies: ["Amazon", "Google"] },
        { id: "g13", name: "Replace O's with X's (Connected Components)", lc: "https://www.geeksforgeeks.org/problems/replace-os-with-xs0052/1", diff: "Medium", companies: ["Google"] },
        { id: "g14", name: "Shortest Path in Binary Matrix", lc: "https://leetcode.com/problems/shortest-path-in-binary-matrix/", diff: "Medium", companies: ["Microsoft", "Google", "Amazon"] },
      ]
    },
    {
      id: "dp",
      name: "DP",
      icon: "∑",
      color: "#f97316",
      problems: [
        { id: "dp1", name: "Climbing Stairs / Count Ways to Nth Stair", lc: "https://leetcode.com/problems/climbing-stairs/", diff: "Easy", companies: ["Adobe", "Amazon", "Microsoft"] },
        { id: "dp2", name: "House Robber", lc: "https://leetcode.com/problems/house-robber/", diff: "Medium", companies: ["Flipkart", "Amazon", "Microsoft"] },
        { id: "dp3", name: "Coin Change (Min Coins)", lc: "https://leetcode.com/problems/coin-change/", diff: "Medium", companies: ["Flipkart", "Amazon", "Microsoft", "Uber"] },
        { id: "dp4", name: "Coin Change (Count Ways)", lc: "https://www.geeksforgeeks.org/problems/coin-change2448/1", diff: "Medium", companies: ["Zoho", "Amazon"] },
        { id: "dp5", name: "0/1 Knapsack / Partition Equal Subset Sum", lc: "https://leetcode.com/problems/partition-equal-subset-sum/", diff: "Medium", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "dp6", name: "Longest Increasing Subsequence", lc: "https://leetcode.com/problems/longest-increasing-subsequence/", diff: "Medium", companies: ["Microsoft", "Amazon", "Google"] },
        { id: "dp7", name: "Longest Common Subsequence", lc: "https://leetcode.com/problems/longest-common-subsequence/", diff: "Medium", companies: ["Amazon", "Google", "Microsoft"] },
        { id: "dp8", name: "Word Break", lc: "https://leetcode.com/problems/word-break/", diff: "Medium", companies: ["Amazon", "Google", "Microsoft"] },
        { id: "dp9", name: "Unique Paths in Grid", lc: "https://leetcode.com/problems/unique-paths/", diff: "Medium", companies: ["Uber", "Amazon", "Google"] },
        { id: "dp10", name: "Unique Paths with Obstacles", lc: "https://leetcode.com/problems/unique-paths-ii/", diff: "Medium", companies: ["Adobe", "Amazon"] },
        { id: "dp11", name: "Jump Game", lc: "https://leetcode.com/problems/jump-game/", diff: "Medium", companies: ["Adobe", "Amazon", "Google"] },
        { id: "dp12", name: "DP Subsequence (Egg Drop / Super Egg Drop)", lc: "https://leetcode.com/problems/super-egg-drop/", diff: "Hard", companies: ["Amazon", "Google"] },
        { id: "dp13", name: "Matrix Chain Multiplication", lc: "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1", diff: "Hard", companies: ["Flipkart", "Amazon"] },
        { id: "dp14", name: "Decode Ways", lc: "https://leetcode.com/problems/decode-ways/", diff: "Medium", companies: ["Amazon", "Microsoft", "Adobe"] },
        { id: "dp15", name: "Combination Sum (Backtracking + DP)", lc: "https://leetcode.com/problems/combination-sum/", diff: "Medium", companies: ["Uber", "Amazon", "Google"] },
        { id: "dp16", name: "Paint N Houses (Distinct Coloring)", lc: "https://www.geeksforgeeks.org/problems/distinct-coloring--170645/1", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "dp17", name: "Split Array Largest Sum", lc: "https://leetcode.com/problems/split-array-largest-sum/", diff: "Hard", companies: ["Google", "Amazon"] },
        { id: "dp18", name: "Integer Break / Maximum Product Cutting", lc: "https://leetcode.com/problems/integer-break/", diff: "Medium", companies: ["Google", "Microsoft"] },
        { id: "dp19", name: "Palindrome Partitioning II", lc: "https://leetcode.com/problems/palindrome-partitioning-ii/", diff: "Hard", companies: ["Google"] },
        { id: "dp20", name: "Number of Dice Rolls with Target Sum", lc: "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/", diff: "Medium", companies: ["Google", "Microsoft"] },
      ]
    },
    {
      id: "binarysearch",
      name: "Binary Search",
      icon: "⌖",
      color: "#06b6d4",
      problems: [
        { id: "bs1", name: "Allocate Minimum Pages / Book Allocation", lc: "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1", diff: "Medium", companies: ["Amazon", "Flipkart"] },
        { id: "bs2", name: "Koko Eating Bananas", lc: "https://leetcode.com/problems/koko-eating-bananas/", diff: "Medium", companies: ["Amazon", "Google"] },
        { id: "bs3", name: "Median of Two Sorted Arrays", lc: "https://leetcode.com/problems/median-of-two-sorted-arrays/", diff: "Hard", companies: ["Amazon", "Google", "Microsoft"] },
        { id: "bs4", name: "Search in Row-Column Sorted Matrix", lc: "https://leetcode.com/problems/search-a-2d-matrix/", diff: "Medium", companies: ["Oracle", "Amazon", "Microsoft"] },
        { id: "bs5", name: "Kth Element in Matrix", lc: "https://www.geeksforgeeks.org/problems/kth-element-in-matrix/1", diff: "Medium", companies: ["Samsung", "Microsoft"] },
        { id: "bs6", name: "Minimum Platforms", lc: "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1", diff: "Medium", companies: ["Atlassian", "Microsoft", "Amazon"] },
      ]
    },
    {
      id: "heaps",
      name: "Heap",
      icon: "⬡",
      color: "#84cc16",
      problems: [
        { id: "h1", name: "Kth Largest Element in Stream", lc: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", diff: "Easy", companies: ["Adobe", "Amazon", "Google"] },
        { id: "h2", name: "Top K Frequent Elements", lc: "https://leetcode.com/problems/top-k-frequent-elements/", diff: "Medium", companies: ["Microsoft", "Amazon", "Google"] },
        { id: "h3", name: "Find Median from Data Stream", lc: "https://leetcode.com/problems/find-median-from-data-stream/", diff: "Hard", companies: ["Morgan Stanley", "Amazon", "Google"] },
        { id: "h4", name: "Merge K Sorted Lists (Heap)", lc: "https://leetcode.com/problems/merge-k-sorted-lists/", diff: "Hard", companies: ["Amazon", "Google", "Microsoft"] },
        { id: "h5", name: "Task Scheduler", lc: "https://leetcode.com/problems/task-scheduler/", diff: "Medium", companies: ["Amazon", "Google"] },
        { id: "h6", name: "Huffman Encoding", lc: "https://www.geeksforgeeks.org/problems/huffman-encoding3345/1", diff: "Medium", companies: ["Morgan Stanley", "Microsoft"] },
      ]
    },
    {
      id: "greedy",
      name: "Greedy",
      icon: "⚡",
      color: "#fbbf24",
      problems: [
        { id: "gr1", name: "Activity Selection / Job Scheduling", lc: "https://www.geeksforgeeks.org/problems/activity-selection-1587115620/1", diff: "Medium", companies: ["Morgan Stanley", "Amazon"] },
        { id: "gr2", name: "Job Sequencing with Deadlines", lc: "https://www.geeksforgeeks.org/problems/job-sequencing-problem5452/1", diff: "Medium", companies: ["Flipkart", "Amazon"] },
        { id: "gr3", name: "Minimum Platforms", lc: "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1", diff: "Medium", companies: ["Atlassian", "Microsoft"] },
        { id: "gr4", name: "Jump Game II (Min Jumps)", lc: "https://leetcode.com/problems/jump-game-ii/", diff: "Medium", companies: ["Amazon", "Google"] },
        { id: "gr5", name: "Overlapping Intervals", lc: "https://www.geeksforgeeks.org/problems/overlapping-intervals--170633/1", diff: "Medium", companies: ["Zoho", "Amazon", "Google"] },
      ]
    },
    {
      id: "backtracking",
      name: "Backtracking",
      icon: "↩",
      color: "#a855f7",
      problems: [
        { id: "bt1", name: "Combination Sum", lc: "https://leetcode.com/problems/combination-sum/", diff: "Medium", companies: ["Uber", "Amazon", "Google"] },
        { id: "bt2", name: "Subsets / Power Set", lc: "https://leetcode.com/problems/subsets/", diff: "Medium", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "bt3", name: "Permutations of a String/Array", lc: "https://leetcode.com/problems/permutations/", diff: "Medium", companies: ["Microsoft", "Amazon", "Google"] },
        { id: "bt4", name: "Solve the Sudoku", lc: "https://leetcode.com/problems/sudoku-solver/", diff: "Hard", companies: ["Samsung", "Microsoft", "Google"] },
        { id: "bt5", name: "Palindrome Partitioning", lc: "https://leetcode.com/problems/palindrome-partitioning/", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "bt6", name: "Word Search in Grid", lc: "https://leetcode.com/problems/word-search/", diff: "Medium", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "bt7", name: "N-Queens", lc: "https://leetcode.com/problems/n-queens/", diff: "Hard", companies: ["Google", "Microsoft"] },
        { id: "bt8", name: "Rat in a Maze", lc: "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1", diff: "Medium", companies: ["Amazon", "Microsoft"] },
      ]
    },
    {
      id: "bitmanip",
      name: "Other", // Using 'Other' since 'Bit Manipulation' isn't in VALID_TOPICS
      icon: "⊕",
      color: "#ef4444",
      problems: [
        { id: "bm1", name: "Number of 1 Bits (Hamming Weight)", lc: "https://leetcode.com/problems/number-of-1-bits/", diff: "Easy", companies: ["Microsoft", "Amazon"] },
        { id: "bm2", name: "Counting Bits", lc: "https://leetcode.com/problems/counting-bits/", diff: "Easy", companies: ["Microsoft", "Amazon"] },
        { id: "bm3", name: "Missing Number (XOR)", lc: "https://leetcode.com/problems/missing-number/", diff: "Easy", companies: ["Amazon", "Microsoft", "Google"] },
        { id: "bm4", name: "Reverse Bits", lc: "https://leetcode.com/problems/reverse-bits/", diff: "Easy", companies: ["Uber", "Microsoft"] },
        { id: "bm5", name: "Find XOR of all Subsets", lc: "https://leetcode.com/problems/subsets/", diff: "Medium", companies: ["Google"] },
        { id: "bm6", name: "Non Repeating Numbers (Find Two)", lc: "https://www.geeksforgeeks.org/problems/finding-the-numbers0215/1", diff: "Medium", companies: ["Google", "Amazon"] },
        { id: "bm7", name: "Sum of Bit Differences", lc: "https://www.geeksforgeeks.org/problems/sum-of-bit-differences2937/1", diff: "Medium", companies: ["Google"] },
        { id: "bm8", name: "Bits Counting", lc: "https://www.geeksforgeeks.org/problems/bits-counting/1", diff: "Easy", companies: ["Uber"] },
      ]
    },
    {
      id: "misc",
      name: "Other",
      icon: "⚙",
      color: "#64748b",
      problems: [
        { id: "m1", name: "Design File System (Trie / HashMap)", lc: "https://leetcode.com/problems/design-file-system/", diff: "Medium", companies: ["Google", "Microsoft"] },
        { id: "m2", name: "Design Search Autocomplete System", lc: "https://leetcode.com/problems/design-search-autocomplete-system/", diff: "Hard", companies: ["Google", "Microsoft"] },
        { id: "m3", name: "My Calendar III (TreeMap)", lc: "https://leetcode.com/problems/my-calendar-iii/", diff: "Hard", companies: ["Google"] },
        { id: "m4", name: "Roman Number to Integer", lc: "https://leetcode.com/problems/roman-to-integer/", diff: "Easy", companies: ["Uber", "Microsoft", "Amazon"] },
        { id: "m5", name: "RegEx Matching", lc: "https://leetcode.com/problems/regular-expression-matching/", diff: "Hard", companies: ["Amazon", "Google"] },
        { id: "m6", name: "Is Valid Sudoku", lc: "https://leetcode.com/problems/valid-sudoku/", diff: "Medium", companies: ["Walmart", "Microsoft"] },
        { id: "m7", name: "Longest Consecutive Sequence", lc: "https://leetcode.com/problems/longest-consecutive-sequence/", diff: "Medium", companies: ["Amazon", "Google", "Microsoft"] },
      ]
    }
  ]
};

// Flatten topics into an array of question objects matching the schema
const dsaQuestions = [];
DSA_DATA.topics.forEach(topic => {
  topic.problems.forEach(prob => {
    // Determine the company (schema allows 'Amazon', 'Google', 'Microsoft', 'Adobe', 'Flipkart', 'Walmart', 'Other', 'N/A')
    const VALID_COMPANIES = ['Amazon', 'Google', 'Microsoft', 'Adobe', 'Flipkart', 'Walmart', 'Other', 'N/A'];
    let primaryCompany = 'Other';
    if (prob.companies && prob.companies.length > 0) {
      const match = prob.companies.find(c => VALID_COMPANIES.includes(c));
      if (match) primaryCompany = match;
    }

    // Set topic to topic.name but if not in valid topics fallback to 'Other'
    const VALID_TOPICS = ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Binary Search', 'Trees', 'Graphs', 'DP', 'Greedy', 'Backtracking', 'Heap', 'DBMS', 'OS', 'CN', 'OOPS', 'JavaScript', 'NodeJS', 'React', 'MongoDB', 'MySQL', 'Other'];
    let finalTopic = topic.name;
    if (!VALID_TOPICS.includes(finalTopic)) {
      if (finalTopic === 'Heap' && !VALID_TOPICS.includes('Heap')) finalTopic = 'Other'; 
      // Heap is actually in VALID_TOPICS
      if (finalTopic === 'DP' || finalTopic === 'Greedy' || finalTopic === 'Backtracking' || finalTopic === 'Heap') {
        // they are valid
      } else {
        finalTopic = 'Other';
      }
    }

    dsaQuestions.push({
      company: primaryCompany,
      topic: finalTopic, 
      chapter: '', // No nested chapter for DSA
      title: prob.name,
      link: prob.lc,
      difficulty: prob.diff,
      status: 'Unsolved',
      category: 'DSA',
      starred: false,
      notes: '',
      content: ''
    });
  });
});

module.exports = dsaQuestions;
