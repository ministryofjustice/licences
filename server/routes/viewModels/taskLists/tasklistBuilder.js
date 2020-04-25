module.exports = {
  tasklist: (context, tasks) => tasks.filter(([, visible]) => visible).map(([task]) => task(context)),

  namedTask: (name) => () => ({ task: name }),
}
