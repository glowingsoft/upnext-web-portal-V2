export const SIGNUP_FLOW_STORAGE_KEY = 'upnext.jwt.signup.draft';
export const SIGNUP_FLOW_STAGE_KEY = 'upnext.jwt.signup.stage';

export const SIGNUP_FLOW_STAGE = {
  ACCOUNT: 'account',
  OTP: 'otp',
  COMPLETE: 'complete',
};

const canUseSessionStorage = () => typeof window !== 'undefined' && Boolean(window.sessionStorage);

export function getSignupFlowDraft() {
  if (!canUseSessionStorage()) return null;

  try {
    const storedDraft = window.sessionStorage.getItem(SIGNUP_FLOW_STORAGE_KEY);
    return storedDraft ? JSON.parse(storedDraft) : null;
  } catch (error) {
    console.error('Unable to read sign-up draft from session storage:', error);
    return null;
  }
}

export function saveSignupFlowDraft(draft) {
  if (!canUseSessionStorage()) return;

  const currentDraft = getSignupFlowDraft() || {};
  window.sessionStorage.setItem(SIGNUP_FLOW_STORAGE_KEY, JSON.stringify({ ...currentDraft, ...draft }));
}

export function clearSignupFlowStorage() {
  if (!canUseSessionStorage()) return;

  window.sessionStorage.removeItem(SIGNUP_FLOW_STORAGE_KEY);
  window.sessionStorage.removeItem(SIGNUP_FLOW_STAGE_KEY);
}

export function setSignupFlowStage(stage) {
  if (!canUseSessionStorage()) return;

  window.sessionStorage.setItem(SIGNUP_FLOW_STAGE_KEY, stage);
}

export function getSignupFlowStage() {
  if (!canUseSessionStorage()) return null;
  return window.sessionStorage.getItem(SIGNUP_FLOW_STAGE_KEY);
}

export function fileToDataUrl(file) {
  if (typeof File === 'undefined' || !(file instanceof File)) {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
