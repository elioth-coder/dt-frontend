<script>
  import {
    Heading,
    Button,
    Spinner,
    Alert,
    Hr,
    Table,
    TableBodyRow,
    TableBodyCell,
    TableHead,
    TableHeadCell,
    Popover,
    Drawer,
    CloseButton,
    Avatar,
  } from "flowbite-svelte";
  import Page from "../Page.svelte";
  import ConfirmModal from "../ConfirmModal.svelte";
  import SemesterService from "../../services/SemesterService";
  import {
    ExclamationCircleSolid,
    InfoCircleSolid,
    PenSolid,
    PrinterOutline,
    TrashBinSolid,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import Breadcrumb from "../Breadcrumb.svelte";
  import SemesterTeacherService from "../../services/SemesterTeacherService";
  import RecipientService from "../../services/RecipientService";
  import TeacherScheduleForm from "./TeacherScheduleForm.svelte";
  import ScheduleService from "../../services/ScheduleService";
  import SubjectService from "../../services/SubjectService";
  import { hr } from "date-fns/locale";
  import { sineIn } from "svelte/easing";
  import { uniqBy, uniqWith } from "lodash-es";
  export let params = {};

  let { HOST_URL } = CONFIG;

  let semester_id = params.id;
  let teacher_id = params.teacher_id;
  let semesterService = new SemesterService();
  let teacherService = new SemesterTeacherService();
  let recipientService = new RecipientService();
  let scheduleService = new ScheduleService();
  let subjectService = new SubjectService();
  let hasUpdate = Date.now();
  let addItem = false;
  let deleteItem = false;
  let editItem = false;
  let asyncDelete = null;
  let semester;
  let teacher;
  let recipient;
  let breadCrumbItems = [
    {
      href: "#/scheduler",
      label: "Scheduler",
    },
    {
      href: "#/scheduler/" + semester_id,
      label: "Semester",
    },
    {
      href: `#/scheduler/${semester_id}/${teacher_id}`,
      label: "Teacher",
    },
  ];

  let shedules_time = [
    "08:00AM - 08:30AM",
    "08:30AM - 09:00AM",
    "09:00AM - 09:30AM",
    "09:30AM - 10:00AM",
    "10:00AM - 10:30AM",
    "10:30AM - 11:00AM",
    "11:00AM - 11:30AM",
    "11:30AM - 12:00NN",
    "12:00NN - 12:30PM",
    "12:30PM - 01:00PM",
    "01:00PM - 01:30PM",
    "01:30PM - 02:00PM",
    "02:00PM - 02:30PM",
    "02:30PM - 03:00PM",
    "03:00PM - 03:30PM",
    "03:30PM - 04:00PM",
    "04:00PM - 04:30PM",
    "04:30PM - 05:00PM",
    "05:00PM - 05:30PM",
    "05:30PM - 06:00PM",
    "06:00PM - 06:30PM",
    "06:30PM - 07:00PM",
    "07:00PM - 07:30PM",
    "07:30PM - 08:00PM",
    "08:00PM - 08:30PM",
    "08:30PM - 09:00PM",
    "09:00PM - 09:30PM",
  ];

  const confirmDelete = (item) => {
    deleteItem = item;
  };

  const handleDelete = async () => {
    // @ts-ignore
    let { id } = deleteItem;
    asyncDelete = scheduleService.delete(id);

    try {
      await asyncDelete;
      hasUpdate = Date.now();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    editItem = false;
    hideDrawer = false;
    editItem = item;
  };

  onMount(async () => {
    semester = await semesterService.get(semester_id);
    teacher = await teacherService.get(teacher_id);
    recipient = await recipientService.get(teacher.personnel_id);
    console.log({ recipient });
    teacher.recipient = { ...recipient };

    updateItems();
  });

  $: hasUpdate,
    (() => {
      updateItems();
    })();

  const resetSchedulePreview = () => {
    occupiedSchedules = [];
    newSchedule = null;

    console.log("reset");
  };

  let asyncItems;
  let items;

  const getSchedules = async (teacher_id, semester_id) => {
    let formData = new FormData();
    formData.set("teacher_id", teacher_id);
    formData.set("semester_id", semester_id);
    let schedules = await scheduleService.getByForm(formData);
    let schedulesWithSubject = [];

    for (let i = 0; i < schedules.length; i++) {
      let schedule = schedules[i];
      let subject = await subjectService.get(schedule.subject_id);

      schedule.subject = subject;
      schedulesWithSubject.push(schedule);
    }

    return schedulesWithSubject;
  };

  const updateItems = async () => {
    if (teacher_id && semester_id) {
      asyncItems = getSchedules(teacher_id, semester_id);
      items = await asyncItems;

      console.log({ items });
    }
  };

  let sectionSchedules = [];

  const handleSectionChange = async (e) => {
    let section = e.detail;
    let formData = new FormData();
    formData.set("semester_id", semester_id);
    formData.set("section", section);

    let schedules = await scheduleService.getByForm(formData);
    let schedulesWithSubject = [];

    for (let i = 0; i < schedules.length; i++) {
      let schedule = schedules[i];
      let subject = await subjectService.get(schedule.subject_id);

      schedule.subject = subject;
      schedulesWithSubject.push(schedule);
    }

    sectionSchedules = [...schedulesWithSubject];
  };

  let roomSchedules = [];

  const handleRoomChange = async (e) => {
    let room = e.detail;
    let formData = new FormData();
    formData.set("semester_id", semester_id);
    formData.set("room", room);

    let schedules = await scheduleService.getByForm(formData);
    let schedulesWithSubject = [];

    for (let i = 0; i < schedules.length; i++) {
      let schedule = schedules[i];
      let subject = await subjectService.get(schedule.subject_id);

      schedule.subject = subject;
      schedulesWithSubject.push(schedule);
    }

    roomSchedules = [...schedulesWithSubject];
  };

  let newSchedule;
  const handleSetSchedule = async (e) => {
    let schedule = e.detail;

    newSchedule = schedule;
  };

  $: occupiedSchedules = uniqBy(
    [...sectionSchedules, ...roomSchedules],
    (schedule) => schedule.id
  );

  const handleCancel = () => {
    editItem = false;
    hideDrawer = true;
    resetSchedulePreview();
  };

  let hideDrawer = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
</script>

<Page>
  <Breadcrumb items={breadCrumbItems} />
  <br />

  <Heading tag="h5" class="text-left align-middle my-0">
    {#if teacher}
      {@const photo = teacher.recipient?.photo
        ? teacher.recipient.photo
        : "profile.png"}
      <Avatar
        src={`${HOST_URL}/uploads/${photo}`}
        size="md"
        class="inline mx-3"
      />
      {teacher.recipient?.name}
    {:else}
      Loading...
    {/if}
    {#if hideDrawer}
      <Button on:click={() => (hideDrawer = false)} class="float-right">
        Add schedule
      </Button>
    {/if}
  </Heading>

  <div class="mb-4">
    {#if asyncDelete}
      {#await asyncDelete}
        <p>
          <Spinner />
          Deleting teacher...
        </p>
      {:then}
        <Alert color="green" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          Successfully deleted the schedule
        </Alert>
      {:catch error}
        <Alert color="red" class="m-0" dismissable>
          <ExclamationCircleSolid slot="icon" class="w-4 h-4" />
          {error.message}
        </Alert>
      {/await}
    {/if}
  </div>
  {#if semester}
    <div class="flex flex-col">
      <Drawer
        backdrop={false}
        activateClickOutside={false}
        transitionType="fly"
        {transitionParams}
        bind:hidden={hideDrawer}
      >
        <div class="flex items-center mb-4">
          <h4
            id="drawer-label"
            class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
          >
            <InfoCircleSolid class="w-5 h-5 me-2.5" />Add new schedule
          </h4>
          <CloseButton
            on:click={() => (hideDrawer = true)}
            class="mb-4 dark:text-white"
          />
        </div>

        <TeacherScheduleForm
          {teacher_id}
          {semester_id}
          item={editItem ?? null}
          on:update={() => (hasUpdate = Date.now())}
          on:cancel={handleCancel}
          on:set-schedule={handleSetSchedule}
          on:change-section={handleSectionChange}
          on:change-room={handleRoomChange}
        />
      </Drawer>
      <br />
      <div class="schedules-container w-full text-left">
        <div style="width: 900px;" class="overflow-visible">
          <section
            class="time-block-header text-center float-start box-border border"
          >
            <h5>TIME/DAY</h5>
          </section>
          {#each ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as day}
            <section
              class="day-block-header text-center float-start border box-border"
            >
              <h5>{day}</h5>
            </section>
          {/each}
        </div>
        <div class="clear-both"></div>
        <div class="schedules_time box-border float-left">
          {#each shedules_time as time}
            <section
              class="time-block w-full text-center box-border border border-t-0 text-sm"
            >
              {time}
            </section>
          {/each}
        </div>
        <div
          class="schedules_day box-border float-left overflow-visible relative"
        >
          {#each shedules_time as time}
            <section
              class="lines w-full text-center box-border border border-t-0"
            ></section>
          {/each}
          {#await asyncItems}
            <h1 class="text-center w-full absolute top-32">
              Loading schedules...
            </h1>
          {:then}
            {#if items}
              {#each items as item}
                {@const day_of_week = item.day_of_week.toLowerCase()}
                {@const start_time = item.start_time
                  .toLowerCase()
                  .replace(" ", "")
                  .replace(":", "-")}
                {@const end_time = item.end_time
                  .toLowerCase()
                  .replace(" ", "")
                  .replace(":", "-")}
                {@const trigger_id =
                  item.subject.code.replace(" ", "_").replace("-", "_") +
                  "_" +
                  item.id}
                <div
                  id={trigger_id}
                  class="cursor-pointer flex flex-col items-center justify-center day-block border {day_of_week} start-{start_time}_end-{end_time} bg-{item.color}-500"
                >
                  <p>{item.subject.code}</p>
                  <p>{item.section}</p>
                </div>
                <Popover
                  trigger="click"
                  placement={"top"}
                  class="w-72 text-sm font-light z-50 text-black bg-gray-200"
                  title={`${item.subject.code} - ${item.subject.title}`}
                  triggeredBy="#{trigger_id}"
                >
                  <span>Day: {item.day_of_week}</span><br />
                  <span>Time: {item.start_time} - {item.end_time}</span><br />
                  <span>Section: {item.section}</span><br />
                  <span>Room: {item.room}</span>
                  <hr class="my-2" />
                  <section class="text-center">
                    <Button
                      on:click={() => handleEdit(item)}
                      size="xs"
                      color="dark"
                      outline>Edit</Button
                    >
                    <Button
                      on:click={() => confirmDelete(item)}
                      size="xs"
                      color="red"
                      outline>Delete</Button
                    >
                  </section>
                </Popover>
              {/each}
            {:else}
              <h1 class="text-center">No schedules found.</h1>
            {/if}
          {/await}
          {#if occupiedSchedules && occupiedSchedules?.length}
            {#each occupiedSchedules as item}
              {@const day_of_week = item.day_of_week.toLowerCase()}
              {@const start_time = item.start_time
                .toLowerCase()
                .replace(" ", "")
                .replace(":", "-")}
              {@const end_time = item.end_time
                .toLowerCase()
                .replace(" ", "")
                .replace(":", "-")}
              {@const trigger_id =
                item.subject.code.replace(" ", "_").replace("-", "_") +
                "_" +
                item.id}
              <div
                id={trigger_id}
                class="cursor-pointer flex flex-col items-center justify-center day-block border {day_of_week} start-{start_time}_end-{end_time} opacity-75 bg-slate-400 border-red-600 border-8"
              >
                <p>{item.room}</p>
                <p>{item.section}</p>
              </div>
              <Popover
                trigger="click"
                placement={"top"}
                class="w-64 text-sm font-light z-50"
                title={`${item.subject.code} - ${item.subject.title}`}
                triggeredBy="#{trigger_id}"
              >
                <span>Day: {item.day_of_week}</span><br />
                <span>Time: {item.start_time} - {item.end_time}</span><br />
                <span>Section: {item.section}</span><br />
                <span>Room: {item.room}</span>
                <hr class="my-2" />
              </Popover>
            {/each}
          {/if}
          {#if newSchedule}
            {@const color = newSchedule.color}
            {@const day_of_week = newSchedule.day_of_week.toLowerCase()}
            {@const start_time = newSchedule.start_time
              .toLowerCase()
              .replace(" ", "")
              .replace(":", "-")}
            {@const end_time = newSchedule.end_time
              .toLowerCase()
              .replace(" ", "")
              .replace(":", "-")}
            <div
              class="cursor-pointer flex flex-col items-center justify-center day-block border {day_of_week} start-{start_time}_end-{end_time} bg-{color}-400 border-green-600 border-8"
            >
              <Heading tag="h6" class="text-center">NEW</Heading>
            </div>
          {/if}
        </div>
      </div>
      <br />
      <div class="flex flex-col">
        <Table striped={true} border={true}>
          <TableHead>
            <TableHeadCell>ROOM NO.</TableHeadCell>
            <TableHeadCell>DAY OF WEEK</TableHeadCell>
            <TableHeadCell class="text-center">TIME</TableHeadCell>
            <TableHeadCell class="text-center">SECTION</TableHeadCell>
            <TableHeadCell class="text-center">SUBJECT</TableHeadCell>
            <TableHeadCell class="text-center">ACTION</TableHeadCell>
          </TableHead>
          {#await asyncItems}
            <TableBodyRow>
              <TableBodyCell colspan={6} class="text-center">
                <Spinner size={4} class="me-1" />
                Fetching items...
              </TableBodyCell>
            </TableBodyRow>
          {:catch error}
            <TableBodyRow>
              <TableBodyCell colspan={6} class="text-center text-red-600">
                {error.message}
              </TableBodyCell>
            </TableBodyRow>
          {/await}
          {#if items}
            {#each items as item}
              <TableBodyRow>
                <TableBodyCell>{item.room}</TableBodyCell>
                <TableBodyCell>{item.day_of_week}</TableBodyCell>
                <TableBodyCell class="text-center">
                  {item.start_time} - {item.end_time}
                </TableBodyCell>
                <TableBodyCell class="text-center">
                  {item.section}
                </TableBodyCell>
                <TableBodyCell>
                  {item.subject.code} - {item.subject.title}
                </TableBodyCell>
                <TableBodyCell>
                  <Button
                    on:click={() => handleEdit(item)}
                    size="xs"
                    color="dark"
                    outline
                  >Edit</Button>
                  <Button
                    on:click={() => confirmDelete(item)}
                    size="xs"
                    color="red"
                    outline
                  >Delete</Button>
                </TableBodyCell>
              </TableBodyRow>
            {:else}
              <TableBodyRow>
                <TableBodyCell colspan={5} class="text-center">
                  No schedules found.
                </TableBodyCell>
              </TableBodyRow>
            {/each}
          {/if}
        </Table>
      </div>
      {#if hideDrawer}
        <section class="w-full text-right my-3">
          <Button icon={true}>
            <PrinterOutline size="lg" />
            Print Schedule
          </Button>
        </section>
      {/if}
    </div>
  {/if}
  <ConfirmModal
    on:continue={handleDelete}
    on:cancel={() => (deleteItem = false)}
    message="Delete this schedule now?"
    open={deleteItem}
  />
</Page>

<style>
  @import "./scheduler.css";
</style>
