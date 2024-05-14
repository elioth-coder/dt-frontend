<script>
  import Router from 'svelte-spa-router';
  import LoginPage from './pages/LoginPage.svelte';
  import HomePage from './pages/HomePage.svelte';
  import DocumentsPage from './components/document/DocumentsPage.svelte';
  import DocumentTrailPage from './components/document_trail/DocumentTrailPage.svelte';
  import SubmissionsPage from './components/submission/SubmissionsPage.svelte';
  import SubmissionStatusPage from './components/submission_status/SubmissionStatusPage.svelte';
  import LocationsPage from './components/location/LocationsPage.svelte';
  import RecipientsPage from './components/recipient/RecipientsPage.svelte';
  import SemestersPage from './components/semester/SemestersPage.svelte';
  import SemesterTeacherPage from './components/semester_teacher/SemesterTeacherPage.svelte';
  import RecordsPage from './pages/RecordsPage.svelte';
  import SubjectsPage from './components/subject/SubjectsPage.svelte';
  import TeacherSchedulePage from './components/teacher_schedule/TeacherSchedulePage.svelte';

  const routes = {
    '/login': LoginPage,
    '/scheduler': SemestersPage,
    '/scheduler/:id': SemesterTeacherPage,
    '/scheduler/:id/:teacher_id': TeacherSchedulePage,
    '/records': RecordsPage,
    '/records/locations': LocationsPage,
    '/records/recipients': RecipientsPage,
    '/records/subjects': SubjectsPage,
    '/submissions': SubmissionsPage,
    '/submissions/:id': SubmissionStatusPage,
    '/documents': DocumentsPage,
    '/documents/:id': DocumentTrailPage,
    '/': HomePage,
  }
</script>

<Router {routes} />