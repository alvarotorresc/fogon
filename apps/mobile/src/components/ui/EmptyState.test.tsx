import { render, screen, fireEvent } from '@testing-library/react-native';
import { EmptyState } from './EmptyState';
import { ShoppingCart } from 'lucide-react-native';

jest.mock('@/constants/useColors', () => ({
  useColors: () => ({
    terracota: '#EA580C',
  }),
}));

jest.mock('lucide-react-native', () => ({
  ShoppingCart: () => 'ShoppingCart',
}));

describe('EmptyState', () => {
  const defaultProps = {
    icon: ShoppingCart,
    title: 'No items yet',
    description: 'Add your first item to get started.',
    actionLabel: 'Add item',
    onAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title and description', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText('No items yet')).toBeTruthy();
    expect(screen.getByText('Add your first item to get started.')).toBeTruthy();
  });

  it('should render the action button with correct label', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText('Add item')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add item' })).toBeTruthy();
  });

  it('should call onAction when button is pressed', () => {
    render(<EmptyState {...defaultProps} />);

    fireEvent.press(screen.getByRole('button', { name: 'Add item' }));

    expect(defaultProps.onAction).toHaveBeenCalledTimes(1);
  });

  it('should render with different props', () => {
    render(
      <EmptyState
        {...defaultProps}
        title="Empty pantry"
        description="Stock up your pantry."
        actionLabel="Add to pantry"
      />,
    );

    expect(screen.getByText('Empty pantry')).toBeTruthy();
    expect(screen.getByText('Stock up your pantry.')).toBeTruthy();
    expect(screen.getByText('Add to pantry')).toBeTruthy();
  });
});
