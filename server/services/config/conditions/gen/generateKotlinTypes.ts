import fs from 'fs'
import * as v1 from '../additionalConditions/v1/conditions'
import * as v2 from '../additionalConditions/v2/conditions'
import { ConditionMetadata } from '../../../../data/licenceClientTypes'

const DESTINATION_DIR = '../hmpps-hdc-api/src/main/kotlin/uk/gov/justice/digital/hmpps/hmppshdcapi/licences/conditions'
const WARNING =
  '// NOTE: DO NOT EDIT DIRECTLY: This is generated via "npm run generate:kotlin-types" in https://github.com/ministryofjustice/licences'

const dataClass = `package uk.gov.justice.digital.hmpps.hmppshdcapi.licences.conditions

${WARNING} 

data class ConditionMetadata(
  val id: String,
  val text: String,
  val userInput: String,
  val fieldPosition: Map<String, Int>,
  val groupName: String,
  val subgroupName: String?,
)
`

const buildKotlinMap = (record) =>
  record
    ? `mapOf(${Object.entries(record)
        .map(([key, value]) => `"${key}" to ${value}`)
        .join(', ')})`
    : 'emptyMap()'

function getAdditionalConditionsText(name: string, conditions: ConditionMetadata[]): string {
  const v1Text = conditions
    .map(
      ({
        id,
        text,
        user_input: userInput,
        field_position: fieldPositions,
        group_name: groupName,
        subgroup_name: subgroupName,
      }) => {
        return `
  ConditionMetadata(
    id = "${id}",
    text = "${text}",
    userInput = "${userInput}",
    fieldPosition = ${buildKotlinMap(fieldPositions)},
    groupName = "${groupName}",
    subgroupName = ${subgroupName && `"${subgroupName}"`},
  )`
      }
    )
    .join(`,`)

  return `package uk.gov.justice.digital.hmpps.hmppshdcapi.licences.conditions

${WARNING}
 
val ${name} = listOf(${v1Text},
)
`
}

function replaceFileContents(fileName: string, content: string) {
  const fullName = `${DESTINATION_DIR}/${fileName}`
  if (fs.existsSync(fullName)) {
    console.log(`deleting: ${fullName}`)
    fs.rmSync(fullName)
  }
  console.log(`writing: ${fullName}\n`)
  fs.writeFileSync(fullName, content)
}

console.log(`generating kotlin condition classes\n`)
replaceFileContents('ConditionMetadata.kt', dataClass)
replaceFileContents('V1Conditions.kt', getAdditionalConditionsText('V1_CONDITIONS', v1.conditions))
replaceFileContents('V2Conditions.kt', getAdditionalConditionsText('V2_CONDITIONS', v2.conditions))

v2.conditions.forEach((c) => {
  console.log(
    `${c.group_name}|${c.subgroup_name || ''}|${c.text}|${(c.field_position && Object.keys(c.field_position).join(', ')) || ''}`
  )
})

console.log(`FIN!\n`)
