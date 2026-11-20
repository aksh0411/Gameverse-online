import NexusLogin from "@/components/ui/nexus-3d-animated-login-futuristic-authentication-ui";

export default function DemoOne() {
  return (
    <NexusLogin
      brandName="NEXUS"
      title="Welcome back"
      description="Sign in to continue to your creative workspace."
      accentColor="#8B5CF6"
      showSocialLogin
      showRememberMe
      showForgotPassword
      show3DScene
      enableAnimations
      enableMouseParallax
    />
  );
}
