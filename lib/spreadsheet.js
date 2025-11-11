const { google } = require('googleapis');
const sheets = google.sheets('v4');

const spreadsheetId = 'your_spreadsheet_id_here';
const range = 'Sheet1!A:C'; // Update as per your sheet's structure
const valueInputOption = 'USER_ENTERED';

module.exports = (config) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'path/to/your/credentials.json', // Path to your service account key file
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const saveToSpreadsheet = async (total, amount, date, currency) => {
    const client = await auth.getClient();
    google.options({ auth: client });

    const resource = {
      values: [[date, total, amount, currency]], // Structure as per your spreadsheet
    };

    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        resource,
      });
      console.log('Sheet updated: ', response.data);
    } catch (err) {
      console.error('The API returned an error: ', err);
    }
  };

  return {
    saveToSpreadsheet,
  };
};
