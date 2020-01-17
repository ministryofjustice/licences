module.exports = {
  // ascending sort of array of objects by one of the object's values
  sortObjArrayAsc: array => {
    array.sort((a, b) => {
      const descriptionA = a.description.toLowerCase()
      const descriptionB = b.description.toLowerCase()

      if (descriptionA < descriptionB) return -1
      if (descriptionA > descriptionB) return 1

      return 0
    })
  },
}
