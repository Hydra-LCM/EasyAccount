import fs from 'fs';

const loadEmailTemplate = (templateFileName) => {
    const templatePath = `./app/assets/emails/templates/${templateFileName}`;
    return fs.readFileSync(templatePath, 'utf8');
};

export const confirmationTemplate = (userName, confirmationCode, lang) => {
    let templateFileName;
    switch (lang) {
        case 'en':
            templateFileName = 'confirmation_email_en.html';
            break;
        default:
            templateFileName = 'confirmation_email_pt.html';
            break;
    }
    const emailTemplate = loadEmailTemplate(templateFileName);
    
    return emailTemplate.replace('${userName}', userName).replace('${confirmationCode}', confirmationCode);
};

export const recoveryPassTemplate = (userName, recoveryCode, lang) => {
    let templateFileName;
    switch (lang) {
        case 'en':
            templateFileName = 'recovery_email_en.html';
            break;
        default:
            templateFileName = 'recovery_email_pt.html';
            break;
    }
    const emailTemplate = loadEmailTemplate(templateFileName);
    
    return emailTemplate.replace('${userName}', userName).replace('${recoveryCode}', recoveryCode);
};
