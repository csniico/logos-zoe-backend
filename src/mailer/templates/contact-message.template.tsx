import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { JSX } from 'react/jsx-dev-runtime';
import React from 'react';

interface ContactMessageTemplateProps {
  message: string;
  email: string;
  name: string;
}

export function ContactMessageTemplate(
  props: ContactMessageTemplateProps,
): JSX.Element {
  const { message, email, name } = props;

  return (
    <Html>
      <Head />
      <Preview>New contact message from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h2}>New Contact Form Submission</Heading>
          <Hr style={hr} />
          <Section style={section}>
            <Row style={row}>
              <Text style={label}>Name:</Text>
              <Text style={value}>{name}</Text>
            </Row>
            <Row style={row}>
              <Text style={label}>Email:</Text>
              <Text style={value}>{email}</Text>
            </Row>
            <Row style={{ ...row, borderBottom: 'none' }}>
              <Text style={label}>Message:</Text>
              <Text style={messageValue}>{message}</Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  border: '1px solid #e6e6e6',
};

const h2 = {
  color: '#2c3e50',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 15px',
  padding: '0 40px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
};

const section = {
  padding: '0 40px',
};

const row = {
  borderBottom: '1px solid #f0f0f0',
  paddingTop: '12px',
  paddingBottom: '12px',
};

const label = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const value = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const messageValue = {
  ...value,
  whiteSpace: 'pre-wrap' as const,
  marginTop: '8px',
};
