module.exports = {
  tasklist: (context, tasks) =>
    tasks.filter(([_, ...visible]) => (visible.length === 0 ? true : visible[0])).map(([task]) => task(context)),

  namedTask: (name) => () => ({ task: name }),
}
