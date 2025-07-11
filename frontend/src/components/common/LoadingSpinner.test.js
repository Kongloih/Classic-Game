import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme/theme';
import LoadingSpinner from './LoadingSpinner';

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    renderWithTheme(<LoadingSpinner />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    renderWithTheme(<LoadingSpinner size={60} />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    renderWithTheme(<LoadingSpinner color="secondary" />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom thickness', () => {
    renderWithTheme(<LoadingSpinner thickness={4} />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with text', () => {
    const loadingText = '加载中...';
    renderWithTheme(<LoadingSpinner text={loadingText} />);
    
    expect(screen.getByText(loadingText)).toBeInTheDocument();
  });

  it('renders with full screen overlay', () => {
    renderWithTheme(<LoadingSpinner fullScreen />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const message = '请稍候...';
    renderWithTheme(<LoadingSpinner message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });
}); 