import './routes.js';
import '/imports/api/locations/data-table-config.js';
import '/imports/api/locations/meteor-methods.js';

import { $ } from 'meteor/jquery';
import dataTablesBootstrap from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
dataTablesBootstrap(window, $);



