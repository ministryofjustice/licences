# Licences - Onboarding New Users

For a new user to log in to Licences they require two sets of data to be pre-loaded:

- An Auth account in the Oauth database to allow a successful login
- A row in the licences database table 'staff_ids' to recognise their username, role and Delius staff id

# Licences Database

This is a Postgresql instance in Amazon RDS.
Connection details to each environment can be requested from either the DSO team, or DevOps people in DPS.
Any SQL client can be used - for example, DBBeaver is fine.
The Licences databases can only be accessed from within the studio IP range (or VPN).


# Quick Outline

* Obtain the user data (CSV) for the region or team being loaded
* Obtain the Delius staff id mapping data (CSF) to correspond with the above users
* Run the pre-processing checks on the data and correct any issues
* Record the numbers of rows in the CSV files 
* Load the Delius staff-ids data
* Load the user data into Auth
* Check that the rows loaded match the expected numbers

# The data load scripts:

| Script Name         |  Purpose                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------|
| user-load.sh        | Uses the Oauth API to create auth accounts                                              |
| staff-ids-load.sh   | Generates a set of SQL statements to create the mapping for username to Delius staff id |

# Pre-Processing Checks of the Data Files

The following are recommended checks to perform on the data to save time later in support issues.

* Usernames - must not contain any special characters or hyphens - only [A-Za-z-0-9] or underscores, and must be between 6-30 characters.
* Column counts - check that provided files have the correct number of columns for all rows
* Spaces - check that spaces do not directly precede or follow a comma - remove these excess spaces.
* Apostrophes - For the Auth load (user-load.sh) these are fine. For the SQL statements, apostrophes must be escaped with another apostrophe ('')
* Duplicates - sort the file and check for duplicates.
* Duplicates whilst running the script - these will show as errors in loading and can be checked/dealt with separately.
* First names - there is a minimum length of 2 characters in Auth - single initials in first names will fail.
* Surnames - there is a minimum length of 2 characters in Auth.
* Quotes - the data is not required to be quoted - the scripts already do this.
* Ctrl characters - sometimes the source data contains control characters eg. ^M, <feff> - remove these prior to running the scripts.
* Alterations - if you alter any key data (username) - then communicate this back to the project - some data (email, staff-id) cannot be altered.


# User Load

- Purpose

Use this to create new Auth accounts, one for each of the new users.
The script uses the OAuth service API to create new users and assign them to the given groups, where applicable.
Each new user will be sent an email to confirm their control of the email account and receive a link to set their password. 

- Usage:

```
$ ./user-load.sh <environment> <client-details> <admin-user> <batch-size> <CSV file> | tee results.txt
```

NOTE: It is worth keeping a file of results to review later - in case of validation problems, duplicates or errors.


- Parameters

* <enviroment> - this is one of t3, t2, preprod or prod
* <client-details> - always 'auth-user-creation:[secret]' - where '[secret]' is the secret in Oauth for the client 'auth-user-creation'
* <admin-user>  -  Use your own admin account - it will be recorded in the audit logs as the username that performed these operations.
* <batch-size>  - The batch size throttles the load (for limits in Gov Notify emailing) - it will pause for 30 seconds between each batch-size records.
* <CSV file>  - The name of the file containing the user data

- File format

* Auth user name
* Email address - must be a validated domain
* Firstname
* Lastname
* Auth group to assign them to - must already exist in the Auth DB

- Example data

```
MaryPiperNPS,mary.piper@email.gov.uk,Mary,Piper,NPS_N02
MaryPaperNPS,mary.paper@email.gov.uk,Mary,Paper,NPS_N02
MaryPippaNPS,mary.pippa@email.gov.uk,Mary,Pippa,NPS_N02
MaryPoppinsNPS,mary.poppins@email.gov.uk,Mary,Poppins,NPS_N02
```

# Staff IDs Load (Mapping)

- Purpose

This script accepts a CSV file containing staff usernames and their Delius staff ID and produces a set of SQL insert statements to load into the Licences database.  The SQL load must then be performed manually using an SQL client. The CSV file is produced by the project for all users in the region being onboarded.

- Usage

```
$ ./staff-ids-load.sh <CSV file>  >  output.sql
```

- Parameters

* <CSV file> - The name of the file containing the CSV data.

- File Format

The CSV file contains the following data :

* Auth username
* Delius staff id
* First name
* Last name
* Org code
* Job Role
* Email address
* Org email address
* Telephone number

- Example data

```
MaryPippinsNPS,NA02280,Mary,Pippins,N02,Officer,mary.pippins@justice.gov.uk,marys-nannies-group@justice.gov.uk,01222 334343
MaryPaperNPS,NA02279,Mary,Paper,N02,Officer,mary.papers@justice.gov.uk,marys-nannies-group@justice.gov.uk,01222 334344
MaryPoppinsNPS,NA02278,Mary,Poppins,N02,Officer,mary.poppins@justice.gov.uk,marys-nannies-group@justice.gov.uk,01222 334355
```

- Executing the SQL

* Use DBBeaver (or other SQL clients - phpAdmin, psql) 
* Obtain a connection to the Licences database for the environment being loaded
* Test the connection
* Open the file containing the generated insert statements (output.sql in the above example)
* Run the SQLs as a single script - check the number of rows reported as inserted
* Close the script when complete
* Run 'select * from staff_ids' and confirm that the new rows are present.

