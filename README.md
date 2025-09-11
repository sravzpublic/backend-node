To generate a crud module

C:\workspace\sravz\backend-node>yo meanjs:crud-module ecocal

     _-----_
    |       |    .------------------------------------------.
    |--(o)--|    | Update available: 1.8.5 (current: 1.4.5) |
   `---------�   |     Run npm install -g yo to update.     |
    ( _�U`_ )    '------------------------------------------'
    /___A___\
     |  ~  |
   __'.___.'__
 �   `  |� � Y `

? Which supplemental folders would you like to include in your angular module? (Press <space> to select)
? Which supplemental folders would you like to include in your angular module?
? Would you like to add the CRUD module links to a menu? Yes
? What is your menu identifier(Leave it empty and press ENTER for the default "topbar" menu)? topbar
   create app\controllers\ecocals.server.controller.js
   create app\models\ecocal.server.model.js
   create app\routes\ecocals.server.routes.js
   create app\tests\ecocal.server.model.test.js
   create app\tests\ecocal.server.routes.test.js
   create public\modules\ecocals\config\ecocals.client.routes.js
   create public\modules\ecocals\controllers\ecocals.client.controller.js
   create public\modules\ecocals\services\ecocals.client.service.js
   create public\modules\ecocals\tests\ecocals.client.controller.test.js
   create public\modules\ecocals\config\ecocals.client.config.js
   create public\modules\ecocals\views\create-ecocal.client.view.html
   create public\modules\ecocals\views\edit-ecocal.client.view.html
   create public\modules\ecocals\views\list-ecocals.client.view.html
   create public\modules\ecocals\views\view-ecocal.client.view.html
   create public\modules\ecocals\ecocals.client.module.js


Regd bower:
//Important: On angularjs upgrade, update ng-animate to match the angularjs
//version else ng-animate load will fail

To Get SSL Certificate:
Files are in workspace folder
To Generate CSR:
Use openssl in git bash to create CSR, or use the existing CSR in work space folder.

$ history
   10  vi sravz.key
   11  vi sravz.cer
   12  vi alphasslintermediate.cer
   13  openssl pkcs12 -export -in sravz.cer -inkey sravz.key -out sravz.pfx -certfile alphasslintermediate.cer


curl -H "Origin: http://localhost:3030" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS --verbose \
'https://s3.amazonaws.com/kodi_test_public/NumberedLinesFile.data'


# Upgrade from Angular 6 - 7:
https://dzone.com/articles/upgrade-to-angular-7-in-5-simple-steps-1

Angular helps to build modern applications for web, mobile, or desktop. Currently, Angular 7 is the latest version. Staying up-to-date with the latest version is very important. Upgrading to Angular 7 takes just a few simple steps:

First, upgrade the Angular version globally by adding the latest version via the terminal: sudo npm install -g @angular/cli@latest
Upgrade the version locally in your project and make sure the changes for the new version are reflected in the package.json fileng update @angular/cli
Upgrade all your dependencies and dev dependencies in package.json
Dependencies:
npm install --save @angular/animations@latest @angular/cdk@latest @angular/common@latest @angular/compiler@latest @angular/core@latest @angular/flex-layout@latest @angular/forms@latest @angular/http@latest @angular/material@latest @angular/platform-browser@latest @angular/platform-browser-dynamic@latest @angular/router@latest core-js@latest zone.js@latest rxjs@latest rxjs-compat@latest
Dev Dependencies:
npm install --save-dev @angular-devkit/build-angular@latest @angular/compiler-cli@latest @angular/language-service @types/jasmine@latest @types/node@latest codelyzer@latest karma@latest karma-chrome-launcher@latest karma-cli@latest karma-jasmine@latest karma-jasmine-html-reporter@latest jasmine-core@latest jasmine-spec-reporter@latest protractor@latest tslint@latest rxjs-tslint@latest webpack@latest
Angular-devkit was introduced in Angular 6 to build Angular applications that required dependency on your CLI projects.
Also, you'll need to upgrade the version for Typescriptnpm install typescript@2.9.2 --save-dev
Now, migrate the configuration of angular-cli.json to angular.jsonng update @angular/cli
ng update @angular/coreIf Angular material is used, use this command:ng update @angular/material
Remove deprecated RxJS 6 features npm install -g rxjs-tslint
  rxjs-5-to-6-migrate -p src/tsconfig.app.json(Please, be patient and wait until the execution completes).
Now, uninstall rxjs-compat as it is an unnecessary dependency for Angular 7.npm uninstall --save rxjs-compat
Also changeimport { Observable } from 'rxjs/Observable';
 toimport { Observable } from 'rxjs';
Finally, start your Angular 7 application using ng serve.

A Few Important Points
Create a file browserlist without any extension in the src directory and add the below lines to it. This file is currently used by auto-prefixer to adjust CSS to support the below specified browsers. For additional information regarding the format and rule options, please see: https://github.com/browserslist/browserslist
For IE 9 through 11 support, please remove 'not' from the last line of the file and adjust as needed.
If you want detailed errors from zone.js, then add import 'zone.js/dist/zone-error';
to top of the enviornment.ts file inside the environment directory.
Move the karma.conf.js file to the src directory.
Move the protractor.conf.js file to the e2e directory.
Switch from HttpModule -> HttpClientModule
HttpService -> HttpClientService
I hope this article helps you to upgrade your Angular application to Angular 7. For any other queries, visit angular official documentation for upgrade by clicking here.