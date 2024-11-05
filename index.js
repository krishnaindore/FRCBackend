const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const readline = require('readline');
const QRCode = require('qrcode');

const fs = require('fs');

const app = express();
const port = 3000;

// Load your service account key JSON file
const KEYFILE = path.join(__dirname, 'path_to_your_service_account_key.json');
const SCOPES = ['https://www.googleapis.com/auth/androidmanagement'];

// Initialize the JWT client
const jwtClient = new google.auth.JWT({
    keyFile: KEYFILE,
    scopes: SCOPES,
});

// Authorize the client
async function authorize() {
    await jwtClient.authorize();
    console.log('Successfully authorized!');
}

// Connect to the Android Management API
async function listEnterprises() {
    const androidmanagement = google.androidmanagement({ version: 'v1', auth: jwtClient });


    try {


        const enterprises = await androidmanagement.enterprises.list({
            projectId: 'manjuandoidmdm'  // Replace with your actual project ID
        });
        
        console.log(enterprises.data.enterprises);
      
           // Now that you have the enterprise name, you can list devices under this enterprise
           const enterpriseName = 'enterprises/LC00wy3o61';  // Replace with your actual enterprise name
           const response = await androidmanagement.enterprises.devices.list({
               parent: enterpriseName
           });
   
           // Get the list of devices
           const devices = response;
           console.log('\nDevices:', devices.config.headers.Authorization);
    } catch (error) {
        console.error('Error listing enterprises:', error);
    }
}
//const androidmanagement = google.androidmanagement('v1');
const androidmanagement = google.androidmanagement({ version: 'v1', auth: jwtClient });


const CALLBACK_URL = 'https://storage.googleapis.com/android-management-quick-start/enterprise_signup_callback.html';
const cloudProjectId = 'manjuandoidmdm';  // Replace with your actual project ID

async function createEnterprise() {
    try {
        // Generate a signup URL
        const signupUrlResponse = await androidmanagement.signupUrls.create({
            projectId: cloudProjectId,
            callbackUrl: CALLBACK_URL
        });

        const signupUrl = signupUrlResponse.data.url;
        const signupUrlName = signupUrlResponse.data.name;

        console.log('Please visit this URL to create an enterprise:', signupUrl);

        // Get the enterprise token from the user
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter the code: ', async (enterpriseToken) => {
            // Complete the creation of the enterprise
            const enterpriseResponse = await androidmanagement.enterprises.create({
                projectId: cloudProjectId,
                signupUrlName: signupUrlName,
                enterpriseToken: enterpriseToken,
                requestBody: {}
            });

            const enterpriseName = enterpriseResponse.data.name;
            console.log('\nYour enterprise name is:', enterpriseName);

            rl.close();
        });

    } catch (error) {
        console.error('Error creating enterprise:', error);
    }
}


const enrollmentToken = {
    qrCode: 'YOUR_QR_CODE_CONTENT'  // Replace with your QR code content
};

async function authenticateAndCreatePolicy() {
    try {
        // Load the service account credentials
        // const auth = new google.auth.GoogleAuth({
        //     keyFile: credentialsFile,
        //     scopes: SCOPES
        // });

        // Create the Android Management API client
        // const androidmanagement = google.androidmanagement({
        //     version: 'v1',
        //     auth: auth
        // });

        // Define the policy with FORCE_INSTALLED apps

        const enterpriseName = 'enterprises/LC00wy3o61';
        const policy = {
            name: `${enterpriseName}/policies/policy-id`,  // Replace 'policy-id' with your policy identifier
            applications: [
                {
                    packageName: 'com.google.samples.apps.iosched',  // Replace with the app's package name
                    installType: 'FORCE_INSTALLED',
                    // defaultPermissionPolicy: 'GRANT'
                }
            ],

            advancedSecurityOverrides: {
                developerSettings: "DEVELOPER_SETTINGS_ALLOWED"
            }         
        };

        // Create or update the policy
        const res = await androidmanagement.enterprises.policies.patch({
            name: policy.name,
            resource: policy
        });

        console.log('Policy created/updated successfully:', res.data);
       
        const tokenRequest = {
            parent: enterpriseName,
            requestBody: {
                policyName: policy.name,  // Replace 'default' with your actual policy ID
                duration: '86400s',  // Token valid for 24 hours (duration in seconds)
                oneTimeOnly: true  // Token can be used only once
            }
        };

        // Create the enrollment token
        const response = await androidmanagement.enterprises.enrollmentTokens.create(tokenRequest);

        // Output the enrollment token and QR code
        console.log('Enrollment Token:', response.data.enrollmentToken);
        console.log('QR Code Data:', response.data.qrCode);
        console.log('Plain Enrollment URL:', response.data);


    } catch (error) {
        console.error('Error while creating/updating policy:', error);
    }
}

// Call the function to authenticate and create the policy


app.use('/static', express.static('public'));

// Create the 'public' folder to store the generated QR codes if it doesn't exist
if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
}


app.get('/reboot/:devicesId', async(req, resp) => {

    const devicesId= req.params.devicesId

   const androidmanagement = google.androidmanagement({ version: 'v1', auth: jwtClient });
   

   try {
       // Send REBOOT command to the device
       const res = await androidmanagement.enterprises.devices.issueCommand({
           name: `enterprises/LC00wy3o61/devices/${devicesId}`,
           requestBody: {
               type: 'REBOOT',
           },
       });

       
       resp.json({
           message: 'REBOOT successfully',
           qrCodeUrl: res
       });
   
       console.log('Reboot command issued successfully:', res.data);
   } catch (error) {
       console.error('Error issuing reboot command:', error);
   }



})


app.get('/list', async(req, resp) => {

   
    const androidmanagement = google.androidmanagement({ version: 'v1', auth: jwtClient });


    try {


        const enterprises = await androidmanagement.enterprises.list({
            projectId: 'manjuandoidmdm'  // Replace with your actual project ID
        });
        
        console.log(enterprises.data.enterprises);
      
           // Now that you have the enterprise name, you can list devices under this enterprise
           const enterpriseName = 'enterprises/LC00wy3o61';  // Replace with your actual enterprise name
           const response = await androidmanagement.enterprises.devices.list({
               parent: enterpriseName
           });
   
           // Get the list of devices
           const devices = response;
           console.log('\nDevices:', devices.data);

           resp.json({
            message: 'list',
            data: {...devices.data}
        });

    } catch (error) {
        console.error('Error listing enterprises:', error);
    }



})


app.get('/', async(req, resp) => {

    
        // Load the service account credentials
        // const auth = new google.auth.GoogleAuth({
        //     keyFile: credentialsFile,
        //     scopes: SCOPES
        // });

        // Create the Android Management API client
        // const androidmanagement = google.androidmanagement({
        //     version: 'v1',
        //     auth: auth
        // });

        // Define the policy with FORCE_INSTALLED apps

        const enterpriseName = 'enterprises/LC00wy3o61';
        const policy = {
            name: `${enterpriseName}/policies/policy-id`,  // Replace 'policy-id' with your policy identifier
            applications: [
                {
                    packageName: 'com.google.samples.apps.iosched',  // Replace with the app's package name
                    installType: 'FORCE_INSTALLED',
                    // defaultPermissionPolicy: 'GRANT'
                }
            ],

            advancedSecurityOverrides: {
                developerSettings: "DEVELOPER_SETTINGS_ALLOWED"
            }         
        };

        // Create or update the policy
        const res = await androidmanagement.enterprises.policies.patch({
            name: policy.name,
            resource: policy
        });

        console.log('Policy created/updated successfully:', res.data);
       
        const tokenRequest = {
            parent: enterpriseName,
            requestBody: {
                policyName: policy.name,  // Replace 'default' with your actual policy ID
                duration: '86400s',  // Token valid for 24 hours (duration in seconds)
                oneTimeOnly: true  // Token can be used only once
            }
        };

        // Create the enrollment token
        const response = await androidmanagement.enterprises.enrollmentTokens.create(tokenRequest);

        // Output the enrollment token and QR code
        //console.log('Enrollment Token:', response.data.enrollmentToken);
      //  console.log('QR Code Data:', response.data.qrCode);
       // console.log('Plain Enrollment URL:', response.data);

    

    const qrText = response.data.qrCode;

    if (!qrText) {
        return resp.send('Please provide text for the QR code');
    }

   
        // Generate QR code and send it as an image to the browser
        const qrCodeDataUrl = await QRCode.toDataURL(qrText);

        const qrCodePath = path.join(__dirname, 'public', `${Date.now()}.png`);

        // Generate the QR code and save it as an image file
        await QRCode.toFile(qrCodePath, qrText);
        const qrCodeUrl = `${req.protocol}://${req.get('host')}/static/${path.basename(qrCodePath)}`;

        
        // Send an HTML page displaying the QR code
        // resp.json(`

        //      <h1>QR Code for: ${qrText}</h1>
          
        //   <br><br>
        //   <a href="/">Generate another QR code</a>
          
        //   <img src="${qrCodeDataUrl}" alt="QR Code">
          
        // `);

        
        resp.json({
            message: 'QR code generated successfully',
            qrCodeUrl: qrCodeUrl
        });

});


async function main() {
    //await authorize();
  //  await listEnterprises();
    await  authenticateAndCreatePolicy();
  //  await createEnterprise();
}

main().catch(console.error);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});