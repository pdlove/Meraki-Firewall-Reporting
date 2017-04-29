# Meraki Firewall Reporting

The purpose of this is to give much more dimension to the data that can be reported on for the Meraki MX Firewalls.
The Meraki cloud is lacking in analytical functions on the reporting to really dig into a user or device and see details.

The current todo list looks like this:
* Collect Syslog Data
* Collect Netflow Data
* Poll VLAN Configuration (Hopefully from SNMP but through the API if needed)
* Add web framework with login and user management (More user features will come later)
* Provide simple GUI for raw data access with filter/search ability
* Correlate URL and Flow data from Syslog
* Correlate Netflow data
* Provide report-views for web traffic and network traffic
  * Per Origin Device
  * Per User
  * Per Destination Device
  * Custom?
* Dashboard views
* Log Management
  * Archival of old data
  * Truncation of old data
  * Consolidation of old data into smaller time intervals
  * Consolidation of old data into smaller chunks (Host instead of full URL/ports)
* Get Clients from Meraki API
* Provide Alerting
  * Alerts to be defined as working these items.
This will denote the completion of the Meraki Work.

After complete with that, we'll continue on to make a more full featured NMS and Log Manager.
* Switch Management - Because, let's face it... Meraki switches are expensive.
  * Collect Syslog Data from data at my disposal.
  * Collect SNMP Data for port utilization
  * Provide Port Association on Switches via Manual Methods. (Using Meraki Clients and Active Directory data as a guide)
  * Provide Port Association on Switches using SNMP and LLDP data (As available)
* User Management
  * User Logon Tracking. 
    * Monitor computers directly for session information to track when the PC is logged into, locked, unlocked and logged off of.
  * User Lockout Tracking
* Workstation Management
  * Power On/Off and Basic Reporting
  * Process Tracking
  * Performance Monitoring
  * Correlate Processes to Network Traffic
  * Patch Management?
  
  
