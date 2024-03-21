<script>
  import Router from 'svelte-spa-router';
  import LoginPage from './pages/LoginPage.svelte';
  import HomePage from './pages/HomePage.svelte';
  import DocumentsPage from './pages/DocumentsPage.svelte';
  import DocumentTrailPage from './pages/DocumentTrailPage.svelte';
  import LocationsPage from './pages/LocationsPage.svelte';
  import RecipientsPage from './pages/RecipientsPage.svelte';

  const routes = {
    '/login': LoginPage,
    '/locations': LocationsPage,
    '/recipients': RecipientsPage,
    '/documents': DocumentsPage,
    '/documents/:id': DocumentTrailPage,
    '/': HomePage,
  }
</script>

<Router {routes} />