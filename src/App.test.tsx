import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chatbot input and button', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Ask a question.../i);
  expect(inputElement).toBeInTheDocument();
  const buttonElement = screen.getByRole('button', { name: /Ask/i });
  expect(buttonElement).toBeInTheDocument();
});
