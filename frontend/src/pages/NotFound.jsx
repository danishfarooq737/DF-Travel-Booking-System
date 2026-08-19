import { Link } from 'react-router-dom';
import RouteLine from '../components/ui/RouteLine.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center animate-fadeUp">
      <RouteLine className="h-16 w-64 text-navy-200" />
      <h1 className="mt-4 text-6xl font-semibold text-navy-900">404</h1>
      <p className="mt-2 max-w-sm text-navy-500">
        This route doesn't exist — looks like this trip took a wrong turn.
      </p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
