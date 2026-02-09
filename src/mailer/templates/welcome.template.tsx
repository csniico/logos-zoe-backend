import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import { JSX } from 'react/jsx-dev-runtime';

interface WelcomeTemplateProps {
  firstName: string;
}

export function WelcomeTemplate(props: WelcomeTemplateProps): JSX.Element {
  const { firstName } = props;

  return (
    <Html>
      <Head />
      <Preview>Welcome to csniico, {firstName}!</Preview>

      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to csniico, {firstName}!</Heading>

          <Text style={text}>
            We’re thrilled to have you on board. Explore our app and let us know
            know know u have any questions.
          </Text>

          <Text style={mutedText}>
            If you didn’t create an account, you can safely ignore this email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            © {new Date().getFullYear()} csniico. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
};

const container = {
  margin: '40px auto',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333333',
};

const text = {
  fontSize: '16px',
  color: '#555555',
};

const mutedText = {
  fontSize: '14px',
  color: '#999999',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
};

const footer = {
  fontSize: '12px',
  color: '#999999',
  textAlign: 'center' as const,
};
