import { render } from '@testing-library/react';
import App from './App';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

expect.extend(toHaveNoViolations);

test('App should have no accessibility violations', async () => {
  const { container } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
