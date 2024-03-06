import fs from 'fs';

const loadEmailTemplate = (templateFileName) => {
    const templatePath = `./app/assets/emails/templates/${templateFileName}`;
    return fs.readFileSync(templatePath, 'utf8');
};

export const confirmationTemplate = (userName, confirmationCode, lang) => {
    let templateFileName = lang === 'en' ? 'confirmation_email_en.html' : 'confirmation_email_pt.html';
    console.log(templateFileName);
    const emailTemplate = loadEmailTemplate(templateFileName);
    
    return emailTemplate.replace('${userName}', userName).replace('${confirmationCode}', confirmationCode);
};

export const recoveryPassTemplate = (userName, recoveryCode, lang) => {
    let templateFileName = lang === 'en' ? 'recovery_email_en.html' : 'recovery_email_pt.html';
    const emailTemplate = loadEmailTemplate(templateFileName);
    
    return emailTemplate.replace('${userName}', userName).replace('${recoveryCode}', recoveryCode);
};
