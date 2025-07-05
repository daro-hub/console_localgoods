import { getTranslations } from 'next-intl/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Package, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default async function ProdottiPage({ params }: { params: Promise<{ locale: string }> }) {
  await params; // Validate params exist
  const t = await getTranslations('products');

  // Dati mock per i prodotti
  const products = [
    {
      id: 1,
      name: 'Pomodori San Marzano',
      category: 'Verdure',
      price: '€3.50/kg',
      status: 'active',
      stock: 45
    },
    {
      id: 2,
      name: 'Olio Extra Vergine',
      category: 'Oli',
      price: '€12.00/L',
      status: 'active',
      stock: 23
    },
    {
      id: 3,
      name: 'Miele di Acacia',
      category: 'Miele',
      price: '€8.50/kg',
      status: 'inactive',
      stock: 0
    },
    {
      id: 4,
      name: 'Basilico Fresco',
      category: 'Erbe',
      price: '€2.00/bunch',
      status: 'active',
      stock: 12
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4" />
            {t('addProduct')}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca prodotti..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Filter className="h-4 w-4" />
              Filtri
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                    {t('productName')}
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                    {t('productCategory')}
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                    {t('productPrice')}
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                    Stock
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                    {t('productStatus')}
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {product.category}
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white font-medium">
                      {product.price}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.stock > 20 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {product.stock} unità
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {product.status === 'active' ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prodotti Totali</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prodotti Attivi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prodotti Esauriti</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
              <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 