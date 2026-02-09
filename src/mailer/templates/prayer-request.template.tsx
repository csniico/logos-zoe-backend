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

interface PrayerRequestTemplateProps {
  title: string;
  message: string;
  topic: string;
  anonymous: boolean;
  email: string;
  name: string;
}

export function PrayerRequestTemplate(
  props: PrayerRequestTemplateProps,
): JSX.Element {
  const { title, message, topic, anonymous, email, name } = props;

  return (
    <Html>
      <Head />
      <Preview>New Prayer Request: {title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h2}>Prayer Request Submitted</Heading>
          <Hr style={hr} />

          <Section style={section}>
            <Row style={row}>
              <Text style={label}>Title</Text>
              <Text style={value}>{title}</Text>
            </Row>

            <Row style={row}>
              <Text style={label}>Topic</Text>
              <Text style={value}>{topic}</Text>
            </Row>

            <Row style={row}>
              <Text style={label}>Prayer Request</Text>
              <Text style={messageValue}>{message}</Text>
            </Row>

            <Row style={row}>
              <Text style={label}>Submitted by</Text>
              <Text style={value}>
                {anonymous ? 'Anonymous' : name || 'No Name Provided'}
              </Text>
            </Row>

            <Row style={row}>
              <Text style={label}>Email</Text>
              <Text style={value}>{email || 'No Email Provided'}</Text>
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
