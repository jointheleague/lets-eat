import './routes.js';
import '/imports/api/locations/data-table-config.js';
import '/imports/api/locations/meteor-methods.js';
import '/imports/ui/admin/location-modal.html';
import '/imports/ui/admin/location-modal.js';
import '/imports/ui/admin/layout.html';
import '/imports/ui/admin/locations.html';
import '/imports/ui/admin/locations.js';
import '/imports/ui/admin/users.html';
import '/imports/ui/admin/users.js';
import '/imports/ui/admin/users-modal.html';
import '/imports/ui/admin/users-modal.js';

import { $ } from 'meteor/jquery';
import dataTablesBootstrap from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
dataTablesBootstrap(window, $);
