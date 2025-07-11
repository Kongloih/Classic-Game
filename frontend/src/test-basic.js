// Basic test to verify our fixes
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import LoadingSpinner from './components/common/LoadingSpinner';

// Test 1: Theme import
console.log('Testing theme import:', theme ? '✅ Theme imported successfully' : '❌ Theme import failed');

// Test 2: Canvas mock
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
console.log('Testing Canvas mock:', ctx ? '✅ Canvas mock working' : '❌ Canvas mock failed');

// Test 3: Component rendering
try {
  const { unmount } = render(
    <ThemeProvider theme={theme}>
      <LoadingSpinner />
    </ThemeProvider>
  );
  console.log('Testing component render: ✅ Component rendered successfully');
  unmount();
} catch (error) {
  console.log('Testing component render: ❌ Component render failed -', error.message);
}

console.log('\n🎉 基本测试完成！'); 