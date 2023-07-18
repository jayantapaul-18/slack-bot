const { App } = require('@slack/bolt');
const axios = require('axios');

// ####################***ENV***###########################
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Set up your webhook URL
const webhookUrl = process.env.SLACK_WEBHOOK_URL;
// ######################***command***############################

// Slash command handler
app.command('/sre', async ({ command, ack, respond }) => {
  try {
    await ack();

    const form = {
      type: 'modal',
      callback_id: 'form_submission',
      title: {
        type: 'plain_text',
        text: 'Form Submission'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'dropdown_block',
          element: {
            type: 'static_select',
            action_id: 'dropdown_action',
            placeholder: {
              type: 'plain_text',
              text: 'Select an option'
            },
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'Option 1'
                },
                value: 'option1'
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Option 2'
                },
                value: 'option2'
              }
              // Add more options as needed
            ]
          },
          label: {
            type: 'plain_text',
            text: 'Dropdown field'
          }
        }
      ],
      submit: {
        type: 'plain_text',
        text: 'Submit'
      }
    };

    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: command.trigger_id,
      view: form
    });
  } catch (error) {
    console.error('Error submitting form:', error);
  }
});

// Form submission handler
app.view('form_submission', async ({ ack, body, view }) => {
  try {
    await ack();

    const user = body.user.id;
    const selectedOption = view.state.values.dropdown_block.dropdown_action.selected_option;

    // Process the submitted data as needed
    // For example, you can store it in a database or send it to an external service
    // Respond to the user with a confirmation message
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: user,
      text: 'Thank you for submitting the form!'
    });
  } catch (error) {
    console.error('Error handling form submission:', error);
  }
});


// #####################***FORM***#########################
const formPayload = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Please submit your request'
        }
      },
      {
        type: 'section',
        block_id: 'dropdown_block',
        text: {
          type: 'mrkdwn',
          text: 'Please select an option:'
        },
        accessory: {
          type: 'static_select',
          action_id: 'dropdown_action',
          placeholder: {
            type: 'plain_text',
            text: 'Select an option'
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: 'SRE Support'
              },
              value: 'option1'
            },
            {
              text: {
                type: 'plain_text',
                text: 'Future Support'
              },
              value: 'option2'
            }
            // Add more options as needed
          ]
        }
      }
    ]
  };
  
  // Send the form payload as a request to the webhook URL
  axios.post(webhookUrl, formPayload)
    .then(response => {
      console.log('Form sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Error sending form:', error);
    });
// ######################***ALERT***##########################

// Slash command handler
app.command('/alert', async ({ command, ack, respond }) => {
    try {
      await ack();
  
      const alertMessage = {
        text: '⚠️ *ALERT!* ⚠️',
        attachments: [
          {
            color: '#FF0000',
            title: 'Important Announcement',
            text: command.text || 'No message provided'
          }
        ]
      };
  
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: command.channel_id,
        ...alertMessage
      });
    } catch (error) {
      console.error('Error sending alert:', error);
    }
});
// ##########################################################
  // Send the custom alert
  const alertMessage = {
    text: '⚠️ *ALERT!* ⚠️',
    attachments: [
      {
        color: '#FF0000',
        title: 'Important Announcement',
      }
    ]
  };
  axios.post(webhookUrl, alertMessage)
    .then(response => {
      console.log('Alert sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Error sending alert:', error);
    });
// #####################***SERVER***##########################
(async () => {
  await app.start(process.env.PORT || 3012);
  console.log('Slack app is running!');
})();
//   #####################***END***#########################
