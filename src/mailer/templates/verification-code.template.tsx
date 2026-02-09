import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { JSX } from 'react/jsx-dev-runtime';

interface VerificationCodeTemplateProps {
  code: string;
  firstName: string;
}

export function VerificationCodeTemplate(
  props: VerificationCodeTemplateProps,
): JSX.Element {
  const { code, firstName } = props;

  return (
    <Html>
      <Head />
      <Preview>Your verification code: {code}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your sign-in</Heading>

          <Text style={text}>Hi {firstName},</Text>

          <Text style={text}>
            We noticed a sign-in attempt to your account. Use the verification
            code below to continue:
          </Text>

          <Section style={codeContainer}>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Text style={mutedText}>
            This code will expire in a few minutes. If you didn’t try to sign
            in, you can safely ignore this email.
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
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px',
  borderRadius: '8px',
  maxWidth: '480px',
};

const heading = {
  fontSize: '22px',
  fontWeight: '600',
  marginBottom: '16px',
  color: '#111827',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  marginBottom: '16px',
};

const codeContainer = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const codeText = {
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '6px',
  color: '#111827',
  margin: '0',
};

const mutedText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#6b7280',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 16px',
};

const footer = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
};
