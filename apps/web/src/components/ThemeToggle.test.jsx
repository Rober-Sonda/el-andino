import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  it('starts in light mode and switches to dark on click', () => {
    localStorage.clear();
    render(<ThemeToggle />);

    expect(screen.getByText('Oscuro')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Claro')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
