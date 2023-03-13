export const formattMailInfo = async (data, env) => {
    let message;
  
    if (data.type === 'template') {
      message = {
        to: data.email,
        from: {
          email: env.sendgrid_sender,
          name: 'SPOWSE'
        },
        subject: data.subject,
        dynamic_template_data: data.dtd,
        template_id: data.templateId
      };
    } else {
      message = {
        to: data.email,
        from: {
          name: 'SPOWSE',
          email: env.sendgrid_sender
        },
        subject: data.subject,
        text: data.text,
        html: data.html
      };
    }
  
    return message;
  };