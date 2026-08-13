import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FirearmDetails from './FirearmDetails';
import api from '../../services/api';
import { deleteMedia } from '../../services/aiService';

const mockDispatch = jest.fn();

jest.mock('../../state/AppState', () => ({
  useAppState: () => ({ token: 'test-token', role: 'client' }),
  useAppDispatch: () => mockDispatch
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn()
  },
  resolveAssetUrl: (url) => url
}));

jest.mock('../../services/aiService', () => ({
  uploadPhoto: jest.fn(),
  deleteMedia: jest.fn()
}));

describe('FirearmDetails photo actions', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    api.put.mockClear();
    deleteMedia.mockClear();
    deleteMedia.mockResolvedValue({ deleted: true });
    api.put.mockResolvedValue({ data: { firearm: { photos: [] } } });
  });

  it('shows a remove photo affordance for uploaded firearm images', async () => {
    render(
      <MemoryRouter initialEntries={['/firearms/test-id']}>
        <Routes>
          <Route path="/firearms/:id" element={<FirearmDetails firearm={{
            _id: 'test-id',
            make: 'Smith',
            model: 'Model 1',
            serial: 'ABC123',
            photos: ['/uploads/grid/test.png'],
            notes: 'ok'
          }} />} />
        </Routes>
      </MemoryRouter>
    );

    const removeButton = screen.getByRole('button', { name: /remove photo/i });
    expect(removeButton).toBeTruthy();

    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(deleteMedia).toHaveBeenCalledWith('test-token', '/uploads/grid/test.png');
    });
  });
});
