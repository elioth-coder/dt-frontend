<script>
  import Router from 'svelte-spa-router';
  import LoginPage from './pages/LoginPage.svelte';
  import HomePage from './pages/HomePage.svelte';
  import DocumentTrailPage from './components/document_trail/DocumentTrailPage.svelte';
  import SubmissionsPage from './components/submission/SubmissionsPage.svelte';
  import SubmissionStatusPage from './components/submission_status/SubmissionStatusPage.svelte';
  import LocationsPage from './components/location/LocationsPage.svelte';
  import RecipientsPage from './components/recipient/RecipientsPage.svelte';
  import SemestersPage from './components/semester/SemestersPage.svelte';
  import SemesterTeacherPage from './components/semester_teacher/SemesterTeacherPage.svelte';
  import StudentProgramPage from './components/student_program/StudentProgramPage.svelte';
  import StudentProgramPrintPage from './components/student_program/StudentProgramPrintPage.svelte';
  import RecordsPage from './pages/RecordsPage.svelte';
  import SubjectsPage from './components/subject/SubjectsPage.svelte';
  import TeacherSchedulePage from './components/teacher_schedule/TeacherSchedulePage.svelte';
  import TeacherSchedulePrintPage from './components/teacher_schedule/TeacherSchedulePrintPage.svelte';
  import SignatoriesPage from './components/signatories/SignatoriesPage.svelte';
  import TeachingLoadPage from './components/teaching_load/TeachingLoadPage.svelte';
  import RoomUtilizationPage from './components/room_utilization/RoomUtilizationPage.svelte';
  import RoomUtilizationPrintPage from './components/room_utilization/RoomUtilizationPrintPage.svelte';

  const routes = {
    '/login': LoginPage,
    '/signatories': SignatoriesPage,
    '/scheduler': SemestersPage,
    '/scheduler/teaching_load/:id': TeachingLoadPage,
    '/scheduler/room_utilization/:id': RoomUtilizationPage,
    '/scheduler/room_utilization/:id/:room': RoomUtilizationPrintPage,
    '/scheduler/student_program/:id': StudentProgramPage,
    '/scheduler/student_program/:semester_id/:section': StudentProgramPrintPage,
    '/scheduler/:id': SemesterTeacherPage,
    '/scheduler/:id/:teacher_id': TeacherSchedulePage,
    '/scheduler/print/:id/:teacher_id': TeacherSchedulePrintPage,
    '/records': RecordsPage,
    '/records/locations': LocationsPage,
    '/records/recipients': RecipientsPage,
    '/records/subjects': SubjectsPage,
    '/submissions': SubmissionsPage,
    '/submissions/:id': SubmissionStatusPage,
    '/document_trail': DocumentTrailPage,
    '/': HomePage,
  }
</script>

<Router {routes} />