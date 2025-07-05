import { redirect } from 'next/navigation';

export default function RootPage() {
  // Reindirizza automaticamente alla pagina italiana dei prodotti (default)
  redirect('/it/products');
}
