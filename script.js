// Google Translate Initialization function (callback for the script)
// This function is called by the Google Translate script itself (via the `cb=googleTranslateElementInit` URL parameter)
function googleTranslateElementInit() {
  // Console logs for development/validation. Conditionally remove for production.
  console.log('Google Translate Element Initializing...');
  try {
    const newIncludedLanguages = 'en,hi,es,ar,fr,zh-CN,ru,de,bn,pt,ja,ur,ta,pa,ko,it,tr,nl,id,vi,th,ml,te,mr,gu,kn'; // Added more languages

    const translateWidget = new google.translate.TranslateElement({
      pageLanguage: 'hi',
      includedLanguages: newIncludedLanguages,
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false // Crucial: Prevents immediate display until button click
    }, 'google_translate_element');
    console.log('Google Translate Element Initialized.');

    // --- Post-Initialization Actions ---
    const widgetDiv = document.getElementById('google_translate_element');
    const translateButton = document.getElementById('translateBtn');
    const hideText = '</span> अनुवाद छुपाएँ<span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌';
    const originalText = '<span class="emoji-pulse">😮</span>Experience the Granth in your mother tongue<span class="emoji-spin">🌍</span>';

    const observer = new MutationObserver((mutations, obs) => {
      if (widgetDiv && widgetDiv.children.length > 0 && widgetDiv.querySelector('.goog-te-gadget-simple')) {
        console.log('Google Translate widget DOM rendered by Google script.');
        translateLoaded = true;
        if (translateButton) {
          translateButton.disabled = false;

          if (translateButton.textContent === 'Loading...') {
            console.log('User clicked Translate button during script load. Showing widget.');
            translateButton.innerHTML = hideText;
            widgetDiv.style.display = 'flex';
            translateButton.setAttribute('aria-expanded', 'true');
          } else {
             console.log('Google Translate widget initialized. Keeping hidden as per button state.');
             widgetDiv.style.display = 'none';
             translateButton.setAttribute('aria-expanded', 'false');
              if (translateButton.innerHTML !== hideText) {
                 translateButton.innerHTML = originalText;
              }
          }
        }
        obs.disconnect();
      } else {
         console.log('Waiting for Google Translate widget DOM (children count:', widgetDiv ? widgetDiv.children.length : 'null', ')');
      }
    });

    const observerTimeout = setTimeout(() => {
        if (!translateLoaded) {
            console.warn('MutationObserver timed out or Google Translate script failed to render the widget DOM within 10 seconds.');
            const btn = document.getElementById('translateBtn');
            if (btn) {
                 if(btn.textContent === 'Loading...') {
                     btn.innerHTML = 'अनुवाद दिखाएँ (लोड समस्या) <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>';
                 }
                 btn.disabled = false;
                 btn.setAttribute('aria-expanded', 'false');
            }
             const widget = document.getElementById('google_translate_element');
             if (widget) {
                 widget.style.display = 'none';
                 widget.setAttribute('aria-hidden', 'true');
             }
            translateLoaded = false;
            observer.disconnect();
        }
    }, 10000);

     if(widgetDiv) {
        observer.observe(widgetDiv, { childList: true, subtree: true });
     } else {
         console.error('Google Translate widget div #google_translate_element not found on page load.');
         clearTimeout(observerTimeout);
         const btn = document.getElementById('translateBtn');
            if (btn) {
                 btn.innerHTML = 'अनुवाद div नहीं मिला <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>';
                 btn.disabled = true;
            }
         translateLoaded = false;
     }

  } catch (error) {
    console.error('Error initializing Google Translate Element:', error);
    const translateButton = document.getElementById('translateBtn');
     if (translateButton) {
        translateButton.disabled = false;
        translateButton.innerHTML = 'अनुवाद लोड नहीं हो सका <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>';
        translateButton.setAttribute('aria-expanded', 'false');
     }
    const widgetDiv = document.getElementById('google_translate_element');
     if(widgetDiv){
        widgetDiv.style.display = 'none';
        widgetDiv.setAttribute('aria-hidden', 'true');
     }
    translateLoaded = false;
  }
}

let translateLoaded = false;

function initTranslate(event) {
  const widget = document.getElementById('google_translate_element');
  const btn = event.currentTarget;
  // const originalText = ''<span class="emoji-pulse">😮</span>Experience the Granth in your mother tongue<span class="emoji-spin">🌍</span>'; // Not needed here if hiding reloads
  const hideText = '<span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span> अनुवाद छुपाएँ';

  if (!widget || !btn) {
      console.error('Translate button or widget element not found.');
      if (btn) btn.disabled = true;
      return;
  }

  if (btn.textContent.includes('Loading') || btn.disabled) {
      console.log('Translate button is busy or disabled, ignoring click.');
      return;
  }

  if (!translateLoaded) {
    console.log('Google Translate widget not initialized. Loading script...');
    btn.disabled = true;
    btn.textContent = 'Loading...';
    btn.setAttribute('aria-expanded', 'false');
    widget.style.display = 'none';
    widget.setAttribute('aria-hidden', 'true');

    let script = document.getElementById('google-translate-script');
    if (!script) {
        script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.defer = true;
        script.id = 'google-translate-script';
        script.onerror = () => {
           console.error('Google Translate script failed to load.');
           btn.disabled = false;
           btn.innerHTML = 'अनुवाद लोड नहीं हो सका <span class="emoji-spin">🌍</span> <span class="emoji-pulse">❌</span>';
           widget.style.display = 'none';
           widget.setAttribute('aria-hidden', 'true');
           translateLoaded = false;
           btn.setAttribute('aria-expanded', 'false');
        };
        document.body.appendChild(script);
        console.log('Google Translate script appended to body.');
    } else {
         console.log('Google Translate script tag already exists. Waiting for googleTranslateElementInit callback...');
    }
  } else {
    console.log('Toggling Google Translate widget display...');
    const isHidden = widget.style.display === 'none' || widget.style.display === '';
    if (isHidden) {
       widget.style.display = 'flex';
       btn.innerHTML = hideText;
       btn.setAttribute('aria-expanded', 'true');
       widget.setAttribute('aria-hidden', 'false');
       console.log('Google Translate widget shown.');
    } else {
       // When hiding the translation, refresh the page to revert to original language
       console.log('Hiding Google Translate widget and refreshing page...');
       window.location.reload();
       // The rest of the code (setting button text, attributes) is not needed here
       // as the page reload will reset them to their initial HTML state.
       // btn.innerHTML = originalText;
       // btn.setAttribute('aria-expanded', 'false');
       // widget.setAttribute('aria-hidden', 'true');
       // console.log('Google Translate widget hidden.');
    }
    // If not reloading, ensure button is enabled.
    // Since reloading is happening in one branch, this only applies if widget was shown.
    if (!isHidden) { // This means we were in the 'else' block, which now reloads.
        // No need to set disabled here if reloading.
    } else { // This means we were in the 'if (isHidden)' block, widget shown.
        btn.disabled = false;
    }
  }
}

function goToChaptersAndPlay() {
  console.log('Scrolling to chapters and attempting music playback...');
  const chaptersHeading = document.querySelector('.chapters-heading');
  if (chaptersHeading) {
    chaptersHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    console.log('Scrolled to chapters heading.');
  } else {
    console.warn('Chapters heading element with class ".chapters-heading" not found. Cannot scroll.');
  }

  const audio = document.getElementById('sitarAudio');
  const stopBtn = document.getElementById('stopMusicBtn');

  if (audio) {
    if (audio.paused || audio.ended) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Music playback started successfully.');
          if (stopBtn) {
            stopBtn.style.display = 'inline-block';
            stopBtn.setAttribute('aria-hidden', 'false');
            console.log('Stop music button shown.');
          }
        }).catch(error => {
          console.warn('Music playback was blocked by the browser or failed:', error);
           if (stopBtn) {
               stopBtn.style.display = 'none';
               stopBtn.setAttribute('aria-hidden', 'true');
               console.log('Stop music button hidden after playback failed.');
           }
        });
      } else {
          console.log('Attempting music playback (browser might block autoplay or not return promise).');
           if (stopBtn) {
              stopBtn.style.display = 'inline-block';
              stopBtn.setAttribute('aria-hidden', 'false');
              console.log('Stop music button shown (optimistic).');
           }
      }
    } else {
      console.log('Music is already playing.');
       if (stopBtn) {
           stopBtn.style.display = 'inline-block';
           stopBtn.setAttribute('aria-hidden', 'false');
           console.log('Stop music button already visible.');
       }
    }
  } else {
    console.warn('Audio element with id "sitarAudio" not found.');
     if (stopBtn) {
           stopBtn.style.display = 'none';
           stopBtn.setAttribute('aria-hidden', 'true');
            console.log('Stop music button hidden because audio element not found.');
       }
  }
}

function stopMusic() {
  console.log('Stopping music playback...');
  const audio = document.getElementById('sitarAudio');
  const stopBtn = document.getElementById('stopMusicBtn');
  if (audio && !audio.paused) {
    audio.pause();
    console.log('Music paused.');
  } else if (audio && audio.paused) {
      console.log('Music is already paused.');
  } else {
      console.warn('Audio element not found or not initialized for stopping.');
  }

  if (stopBtn) {
    stopBtn.style.display = 'none';
    stopBtn.setAttribute('aria-hidden', 'true');
    console.log('Stop music button hidden.');
  }
}

function toggleChapter(chapterDiv) {
  const heading = chapterDiv.querySelector('h2');
  const content = chapterDiv.querySelector('.content');
  const isActive = chapterDiv.classList.contains('active');
  const allChapters = document.querySelectorAll('#chapters .chapter');

  if (!heading || !content) {
    console.error('toggleChapter called on element without h2 or .content child:', chapterDiv);
    return;
  }

  console.log(`Toggling chapter: "${heading.textContent.trim()}" (Current state: ${isActive ? 'Open' : 'Closed'})`);

  if (isActive) {
    chapterDiv.classList.remove('active');
    heading.setAttribute('aria-expanded', 'false');
    content.style.display = 'none';
    content.setAttribute('aria-hidden', 'true');
    content.setAttribute('tabindex', '-1');
    console.log('Chapter collapsed.');
     setTimeout(() => {
        heading.focus();
        console.log('Focus returned to heading of collapsed chapter.');
     }, 0);
    return;
  }

  allChapters.forEach(otherChapter => {
    if (otherChapter !== chapterDiv && otherChapter.classList.contains('active')) {
      console.log('Closing other active chapter: "' + otherChapter.querySelector('h2').textContent.trim() + '"');
      otherChapter.classList.remove('active');
      const otherHeading = otherChapter.querySelector('h2');
      const otherContent = otherChapter.querySelector('.content');
      if (otherHeading && otherContent) {
        otherHeading.setAttribute('aria-expanded', 'false');
        otherContent.style.display = 'none';
        otherContent.setAttribute('aria-hidden', 'true');
        otherContent.setAttribute('tabindex', '-1');
      } else {
        console.warn('Could not find h2 or .content in other chapter for closing logic.');
      }
    }
  });

  chapterDiv.classList.add('active');
  heading.setAttribute('aria-expanded', 'true');
  content.style.display = 'block';
  content.setAttribute('aria-hidden', 'false');
  content.setAttribute('tabindex', '0');
  console.log('Chapter expanded.');

  heading.scrollIntoView({ behavior: 'smooth', block: 'start' });

  setTimeout(() => {
    if (chapterDiv.classList.contains('active')) {
        heading.focus();
        console.log('Focus set to expanded chapter heading.');
    }
  }, 100);
}


document.addEventListener('keydown', function(event) {
  const target = event.target;

  if (target && target.tagName === 'H2' && target.getAttribute('role') === 'button' && target.closest('.chapter')) {
    const chapter = target.parentElement;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleChapter(chapter);
    }
  }

  if (event.key === 'Escape') {
    const focusedElement = document.activeElement;
    const contentArea = focusedElement ? focusedElement.closest('.chapter.active .content') : null;

    if (contentArea) {
      const chapter = contentArea.closest('.chapter.active');
      if (chapter) {
        event.preventDefault();
        toggleChapter(chapter);
      }
    }
  }
});

document.body.addEventListener('mousedown', function() {
  requestAnimationFrame(() => {
      document.body.classList.add('using-mouse');
  });
});
document.body.addEventListener('keydown', function(event) {
  const isModifierAlone = ['Control', 'Shift', 'Alt', 'Meta'].includes(event.key);
  const isFunctionKey = event.key.startsWith('F') && event.key.length <= 3 && !isNaN(parseInt(event.key.substring(1)));
  const isNavigationKey = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Escape', 'Enter', ' '].includes(event.key);

  if ((!isModifierAlone && !isFunctionKey) || isNavigationKey) {
     requestAnimationFrame(() => {
          document.body.classList.remove('using-mouse');
     });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded. Performing initial setup and validation.');

  const stopBtn = document.getElementById('stopMusicBtn');
  const translateBtn = document.getElementById('translateBtn');

  if (stopBtn) {
    stopBtn.setAttribute('aria-hidden', 'true');
  } else {
      console.warn('Stop music button with id "stopMusicBtn" not found.');
  }

  if (translateBtn) {
     translateBtn.setAttribute('aria-controls', 'google_translate_element');
     translateBtn.setAttribute('aria-expanded', 'false');
     const initialOriginalText = '<span class="emoji-pulse">😮</span>Experience the Granth in your mother tongue<span class="emoji-spin">🌍</span>';
     if (translateBtn.innerHTML.replace(/\s+/g, ' ').trim() !== initialOriginalText.replace(/\s+/g, ' ').trim()) {
        translateBtn.innerHTML = initialOriginalText;
        console.log('Translate button initial text normalized/set by JS.');
     }
  } else {
       console.warn('Translate button with id "translateBtn" not found.');
  }

   const translateWidgetDiv = document.getElementById('google_translate_element');
    if(translateWidgetDiv){
         translateWidgetDiv.setAttribute('aria-hidden', 'true');
    } else {
         console.warn('Translate widget div with id "google_translate_element" not found.');
    }

  document.querySelectorAll('#chapters .chapter').forEach(chapter => {
    const heading = chapter.querySelector('h2');
    const content = chapter.querySelector('.content');

    if (heading && content) {
        if (!heading.id) {
            const cleanText = (heading.textContent.match(/[a-zA-Z0-9]+/g) || ['chapter']).join('-').toLowerCase();
            heading.id = `heading-${cleanText}-${Math.random().toString(36).substr(2, 5)}`;
            console.log(`Generated ID for heading: ${heading.id}`);
        }
        if (!content.id) {
             content.id = `content-${heading.id.replace('heading-', '')}`;
             console.log(`Generated ID for content: ${content.id}`);
        }
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      heading.setAttribute('aria-expanded', 'false');
      heading.setAttribute('aria-controls', content.id);
      content.setAttribute('role', 'region');
      content.setAttribute('aria-hidden', 'true');
      content.setAttribute('tabindex', '-1');
      content.setAttribute('aria-labelledby', heading.id);

      if (!chapter.classList.contains('active')) {
          content.style.display = 'none';
      } else {
          heading.setAttribute('aria-expanded', 'true');
          content.setAttribute('aria-hidden', 'false');
          content.setAttribute('tabindex', '0');
          content.style.display = 'block';
      }

    } else {
      console.warn('Skipping ARIA setup for incomplete chapter structure. Ensure each .chapter has an h2 and .content child:', chapter);
    }
  });

  validateDocument();
  console.log('Initial DOM setup, ARIA, keyboard handlers, and asset checks complete.');
});

function validateDocument() {
    console.log('Running basic HTML and Accessibility validation check...');
    if (document.doctype === null || document.doctype.name.toLowerCase() !== 'html') {
      console.error('Validation Error: Missing or incorrect DOCTYPE. Must be <!DOCTYPE html> as the very first line.');
    }
    const htmlElement = document.documentElement;
    if (!htmlElement.lang || htmlElement.lang.trim() === '') {
      console.warn('Accessibility Warning: <html> element is missing the "lang" attribute. Specify the primary language (e.g., lang="hi").');
    } else if (htmlElement.lang.toLowerCase() !== 'hi' && !htmlElement.closest('[class*="translated"]')) {
       // Check if googleTranslateElementInit exists and if pageLanguage property can be accessed
       // The pageLanguage setting is part of the object passed to TranslateElement, not a static prop of the init function itself.
       // This log is more for developer info and won't have access to that internal setting directly here.
       const translateInstancePageLang = (typeof google !== 'undefined' && google.translate && google.translate.TranslateElement && google.translate.TranslateElement.pageLanguage)
                                         ? google.translate.TranslateElement.pageLanguage
                                         : 'unknown (TranslateElement not yet initialized or pageLanguage not exposed)';
       console.warn(`Potential Mismatch: HTML lang attribute is "${htmlElement.lang}", but content appears to be primarily Hindi. Configured page language for translate (if initialized): ${translateInstancePageLang}.`);
    }

    if (!document.title || document.title.trim() === '') {
      console.warn('Accessibility Warning: Document title (<title>) is missing or empty. The title is crucial for browser tabs, bookmarks, and screen readers.');
    } else if (document.title.trim().length < 10) {
       console.warn(`Suggestion: Document title is very short ("${document.title.trim()}"). Consider making it more descriptive.`);
    }

    const mainElement = document.querySelector('main');
    if (!mainElement) {
      console.warn('HTML Structure Warning: Missing <main> element. The primary content should be enclosed in a <main> tag.');
    } else {
       if(mainElement.children.length === 0 && mainElement.textContent.trim().length === 0){
            console.warn('HTML Structure Warning: <main> element appears empty or contains only whitespace. It should contain the page\'s primary content sections.');
       }
      const bodyChildren = Array.from(document.body.children);
      const mainIndex = bodyChildren.indexOf(mainElement);
      const footerElement = document.querySelector('footer');
      const footerIndex = footerElement ? bodyChildren.indexOf(footerElement) : -1;

       if (mainIndex > -1 && footerIndex > -1 && footerIndex < mainIndex){
            console.warn('HTML Structure Warning: <footer> element appears before <main>. The main content should typically come before the footer.');
       } else if (mainIndex > -1 && footerIndex > mainIndex) {
           const elementsBetweenMainAndFooter = bodyChildren.slice(mainIndex + 1, footerIndex);
           const nonContentElements = ['SCRIPT', 'STYLE', 'AUDIO', 'TEMPLATE', 'LINK', 'META', 'TITLE', 'NOSCRIPT'];
            const significantElementsBetween = elementsBetweenMainAndFooter.filter(el =>
                !nonContentElements.includes(el.tagName.toUpperCase()) &&
                !el.classList.contains('visually-hidden') &&
                el.offsetParent !== null
            );
           if(significantElementsBetween.length > 0){
               console.warn('HTML Structure Warning: Significant elements found between <main> and <footer>. All primary page content (except footer/header) should ideally be within <main>. First example element:', significantElementsBetween[0]);
           }
       }
    }

    document.querySelectorAll('section').forEach((section, index) => {
       const sectionHeading = section.querySelector('h1, h2, h3, h4, h5, h6');
       const hasAriaLabel = section.hasAttribute('aria-label') || section.hasAttribute('aria-labelledby');
       if (section.getAttribute('role') === 'region' && !hasAriaLabel) {
           console.warn(`Accessibility Warning: Section (ID: ${section.id || 'N/A'}, Index: ${index + 1}) has role="region" but is missing an 'aria-label' or 'aria-labelledby'. Region landmarks require labels.`);
       }
       if (section.getAttribute('role') !== 'region' && !sectionHeading && !hasAriaLabel) {
           console.warn(`Accessibility Suggestion: Section (ID: ${section.id || 'N/A'}, Index: ${index + 1}) lacks a semantic heading (h1-h6) or ARIA label. Consider adding one for better structure.`);
       }
    });

     document.querySelectorAll('img').forEach(img => {
         const imgSrc = img.getAttribute('src');
         const imgAlt = img.getAttribute('alt');
         if (imgSrc && imgSrc.startsWith('assets/') && !['hero-unity.jpg', 'new-google-logo.png'].includes(imgSrc.substring('assets/'.length))) {
             console.warn(`Disallowed Asset Warning: Image source references 'assets/' but is not one of the permitted files (hero-unity.jpg, new-google-logo.png): "${imgSrc}". Please use allowed assets.`);
         }
         if (imgAlt === null) {
             console.warn(`Accessibility Warning: Image with src "${imgSrc || 'unknown'}" is missing the 'alt' attribute entirely.`);
         } else if (imgAlt.trim().length === 0 && img.getAttribute('role') !== 'presentation') {
             console.warn(`Accessibility Warning: Image with src "${imgSrc || 'unknown'}" has an empty 'alt' attribute. Provide descriptive alt text or role="presentation" if decorative.`);
         } else if (imgAlt.trim().length > 0 && imgAlt.trim().length < 5 && img.getAttribute('role') !== 'presentation') {
              console.warn(`Accessibility Suggestion: Alt text for image "${imgSrc || 'unknown'}" is very short ("${imgAlt.trim()}"). Ensure it is descriptive if the image conveys information.`);
         }
     });

    document.querySelectorAll('audio').forEach((audio, index) => {
        const hasAriaDescription = audio.hasAttribute('aria-describedby');
         if (!hasAriaDescription) {
            console.warn(`Accessibility Warning: Audio element #${index + 1} (ID: ${audio.id || 'N/A'}) is missing 'aria-describedby' attribute linking to a description for non-obvious audio content.`);
         } else {
            const descId = audio.getAttribute('aria-describedby');
             if (!document.getElementById(descId)) {
                console.warn(`Accessibility Warning: The element referenced by aria-describedby="${descId}" for audio element #${index + 1} (ID: ${audio.id || 'N/A'}) was not found.`);
             }
         }
        let validSourceFound = false;
        const allowedSources = ['Eternal-Harmony.mp3'];
        const sources = audio.querySelectorAll('source');
        const srcAttr = audio.getAttribute('src');

         if (srcAttr && srcAttr.startsWith('assets/')) {
             const audioFileName = srcAttr.substring('assets/'.length);
             if (allowedSources.includes(audioFileName)) {
                 validSourceFound = true;
             } else {
                 console.warn(`Disallowed Asset Warning: Audio 'src' attribute on element (ID: ${audio.id || 'N/A'}) references 'assets/' but is not ${allowedSources.join(' or ')}: "${srcAttr}".`);
             }
         }
        sources.forEach(source => {
            const sourceSrc = source.getAttribute('src');
             if (sourceSrc && sourceSrc.startsWith('assets/')) {
                 const sourceFileName = sourceSrc.substring('assets/'.length);
                 if (allowedSources.includes(sourceFileName)) {
                     validSourceFound = true;
                 } else {
                     console.warn(`Disallowed Asset Warning: Audio <source> for element (ID: ${audio.id || 'N/A'}) references 'assets/' but is not ${allowedSources.join(' or ')}: "${sourceSrc}".`);
                 }
             }
        });
        if (!validSourceFound && (srcAttr || sources.length > 0)) {
             console.warn(`Disallowed Asset Warning: Audio element #${index + 1} (ID: ${audio.id || 'N/A'}) was intended to have sound but found no valid sources from 'assets/' (must be ${allowedSources.join(' or ')}). Check paths and filenames.`);
        } else if (!srcAttr && sources.length === 0) {
            console.log(`Info: Audio element #${index + 1} (ID: ${audio.id || 'N/A'}) has no 'src' attribute or <source> children. Assuming no audio intended.`);
        }
    });

    document.querySelectorAll('table').forEach((table, index) => {
        const hasCaption = table.querySelector('caption');
        const hasTHead = table.querySelector('thead');
        const hasThInTBody = table.querySelector('tbody > tr > th');

        if (!hasCaption) {
             console.warn(`Accessibility Warning: Table #${index + 1} is missing a <caption> element. Captions provide a summary for screen readers.`);
        }
        if (!hasTHead && !hasThInTBody) {
             console.warn(`Accessibility Warning: Table #${index + 1} seems to be missing <th> (table header) elements, or a <thead> structure. Use <th> to semantically identify headers.`);
        } else {
            table.querySelectorAll('th').forEach(th => {
                 if (!th.hasAttribute('scope')) {
                    console.warn(`Accessibility Suggestion: Add 'scope="col"' or 'scope="row"' to <th> element ("${th.textContent.trim()}") in Table #${index + 1} for improved accessibility.`);
                 }
            });
        }
    });

    document.querySelectorAll('ul, ol').forEach((list, index) => {
        const hasNonLiChildren = [...list.children].some(child => child.tagName !== 'LI');
        if (hasNonLiChildren) {
             console.warn(`HTML Structure Warning: List #${index + 1} (<${list.tagName}>) contains direct child elements that are NOT <li>. Ensure lists only contain <li> as direct children for correct semantics.`);
        }
    });
    console.log('Basic HTML and Accessibility validation check complete.');
  }