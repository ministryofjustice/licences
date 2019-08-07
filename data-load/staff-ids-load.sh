#!/bin/bash
#
# Script to process the mapping data and produce insert statements for the licences staff_ids table.
# The insert statements should be run into the appropriate RDS postgresql DB by connecting an SQL
# client (DBBeaver, pgAdmin etc) and executing/committing them. 
#
# Parameters:
# 
#       1. FILE - the name of the file containing the user data
#
# Example:
# 
# $ ./staff-ids-load.sh mapping-data.txt
#
# Comma-separated file of staff users containing :
#
#        1) nomis_id - the Nomis username eg. JULIE_WOOD
#        2) staff_id the staff id of this user in Delius e.g SH0005
#        3) First name - e.g. Jim
#        4) Last name - e.g. Smith
#        5) Organisation - e.g C02
#        6) Job role - e.g. Probation Officer
#        7) Email - e.g. jim.smith@nps.gov.uk
#        8) OrgEmail - e.g northeast-region@nps.gov.uk
#        9) Tel number - e.g. 01877 323232
#

FILE=${1?No file specified}

# Check whether the file exists and is readable
if [[ ! -f "$FILE" ]]; then
  echo "Unable to find file $FILE"
  exit 1
fi

# Translate CSV input to SQL statement output

while read LINE
do

  IFS=","
  read nomis_id staff_id first last org role email org_email tel <<< `echo "$LINE"`

  # Output an SQL insert statement
  echo "insert into staff_ids (nomis_id, staff_id, first_name, last_name, organisation, job_role, email, telephone, org_email, auth_onboarded) "
  echo "values ('$nomis_id', '$staff_id', '$first', '$last', '$org','$role','$email', '$tel', '$org_email', true);"
  echo ""

done < $FILE

# End
