export const demoUser = { id: 'u1', name: 'Alex Morgan', email: 'alex@orbit.team', initials: 'AM', color: '#e2b6ff' };
export const demoMembers = [demoUser, { id: 'u2', name: 'Priya Shah', initials: 'PS', color: '#bdebd6' }, { id: 'u3', name: 'Jordan Lee', initials: 'JL', color: '#ffd7a8' }];
export const initialProject = { id: 'p1', name: 'Launch website', description: 'Website refresh · Q3', members: demoMembers };
export const initialTasks = [
  { id: 't1', title: 'Finalize homepage copy', description: 'Polish the headline and supporting proof points before review.', status: 'todo', priority: 'high', assigneeId: 'u2', dueDate: '2026-08-28', labels: ['Content'], comments: 3 },
  { id: 't2', title: 'Design pricing section', description: 'Explore the comparison table and mobile states.', status: 'todo', priority: 'medium', assigneeId: 'u3', dueDate: '2026-08-30', labels: ['Design'], comments: 5 },
  { id: 't3', title: 'Set up analytics events', description: 'Track signups, navigation and activation moments.', status: 'inprogress', priority: 'medium', assigneeId: 'u1', dueDate: '2026-08-27', labels: ['Development'], comments: 2 },
  { id: 't4', title: 'QA responsive layouts', description: 'Run through the key breakpoints on real devices.', status: 'inprogress', priority: 'low', assigneeId: 'u3', dueDate: '2026-09-02', labels: ['QA'], comments: 1 },
  { id: 't5', title: 'Create launch checklist', description: 'Gather all pre-launch tasks in one place.', status: 'done', priority: 'low', assigneeId: 'u2', dueDate: '2026-08-21', labels: ['Operations'], comments: 4 },
  { id: 't6', title: 'Share staging link', description: 'Send the latest staging build to the wider team.', status: 'done', priority: 'medium', assigneeId: 'u1', dueDate: '2026-08-22', labels: ['Launch'], comments: 2 },
];
