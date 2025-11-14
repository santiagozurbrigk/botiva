import { useMemo, useState } from 'react';
import { api } from '../../lib/api';

const SECTIONS = [
  'Plancha',
  'Frituras',
  'Postres',
  'Bebidas',
  'Heladera',
  'Preparación fría',
  'Despensa',
  'Otro',
];

const STORAGE_KEY = 'botiva_stock_restaurant_id';

export default function StockRequest() {
  const initialRestaurantId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('restaurant_id');
    if (idFromUrl) {
      localStorage.setItem(STORAGE_KEY, idFromUrl);
      return idFromUrl;
    }
    return localStorage.getItem(STORAGE_KEY) || '';
  }, []);

  const [restaurantId, setRestaurantId] = useState(initialRestaurantId);
  const [formData, setFormData] = useState({
    section: '',
    requester_name: '',
    missing_items: '',
    additional_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const shareableLink =
    typeof window !== 'undefined' && restaurantId
      ? `${window.location.origin}${window.location.pathname}?restaurant_id=${restaurantId}`
      : '';

  const handleRestaurantIdChange = value => {
    setRestaurantId(value.trim());
    if (value.trim()) {
      localStorage.setItem(STORAGE_KEY, value.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!restaurantId) {
      setErrorMessage(
        'Necesitamos saber a qué restaurante pertenece este pedido. Copia el enlace con ?restaurant_id=<UUID> o ingresa el restaurant_id manualmente.'
      );
      setSubmitting(false);
      return;
    }

    try {
      await api.createStockRequest({
        ...formData,
        restaurant_id: restaurantId,
      });
      setSuccessMessage('¡Pedido enviado! Gracias por actualizar el stock.');
      setFormData({
        section: '',
        requester_name: '',
        missing_items: '',
        additional_notes: '',
      });
    } catch (error) {
      setErrorMessage(error.message || 'No pudimos enviar el pedido. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pedido de Stock</h1>
          <p className="mt-2 text-gray-600">
            Completá este formulario para informar los insumos faltantes de tu plaza.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800">
            {errorMessage}
          </div>
        )}

        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-sm font-semibold text-indigo-900 mb-2">Restaurante destino</p>
          <p className="text-sm text-indigo-800">
            Este formulario necesita saber a qué restaurante pertenece el pedido de stock.
            Usa el ID que aparece en el panel de Super Admin o comparte el enlace con
            <code className="mx-1 px-1 py-0.5 bg-white rounded text-xs">?restaurant_id=&lt;UUID&gt;</code>
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <input
              type="text"
              value={restaurantId}
              onChange={(event) => handleRestaurantIdChange(event.target.value)}
              placeholder="Ej: 0301f342-f19b-42cb-95b4-daa693962492"
              className="block w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white transition-colors font-mono text-sm"
            />
            {shareableLink && (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(shareableLink)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-100 transition"
              >
                Copiar enlace con restaurant_id
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plaza / Sección
            </label>
            <select
              value={formData.section}
              onChange={(event) => handleChange('section', event.target.value)}
              required
              className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white transition-colors"
            >
              <option value="">Selecciona una plaza</option>
              {SECTIONS.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre (opcional)
            </label>
            <input
              type="text"
              value={formData.requester_name}
              onChange={(event) => handleChange('requester_name', event.target.value)}
              placeholder="Ej: Juan Pérez"
              className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detallá qué insumos faltan
            </label>
            <textarea
              value={formData.missing_items}
              onChange={(event) => handleChange('missing_items', event.target.value)}
              required
              rows={6}
              placeholder="Ej: 5 kg de carne, 2 bolsas de papas, 1 bidón de aceite..."
              className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={formData.additional_notes}
              onChange={(event) => handleChange('additional_notes', event.target.value)}
              rows={3}
              placeholder="Ej: Urgente para mañana, revisar proveedor, etc."
              className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 bg-white transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Esta información llegará automáticamente al panel de administración.
        </p>
      </div>
    </div>
  );
}

