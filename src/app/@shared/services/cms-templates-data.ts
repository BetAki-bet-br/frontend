import { TemplateData } from '@icore/ngx-portalgateway-api-client-atl';

// ContentType: Promotion = 3; Banner = 2

/**
 * Definition of templates as they are in the database. This should be ONLY USED IN DEVELOPMENT!
 */
export const TEMPLATES: TemplateData[] = [
  /**
   * Fields
      Image
      Title 1
      Title 2
      Description
      Button 1 - URL - non authenticated
      Button 2 - URL - Optin authenticated, not opted in
      Button 3 - label - authenticated, opted in
      Button 3 - URL - authenticated, opted in
      Label - T&C
      URL - T&C
      Image 1
      Button 1 - label - non authenticated
   */
  {
    id: 1,
    contentType: 'Promotion',
    brandId: 3,
    name: 'Promotion page',
    description: 'Promotion Template 1',
    htmlDefinition: `
<div class="promotion-tile-template">
  <div class="bonus-item">
    <img
      id="bonus-illustration-image-{{promotionId}}"
      alt="{{Title 2}}"
      class="bonus-illustration"
      style="background-image: url({{backgroundImageUrl}});"
      src="{{Image}}"
      width="160"
      height="230"
      fetchpriority="high"
      loading="eager"
      onerror="this.onerror=null; this.src='{{backgroundImagePlaceholderUrl}}'"
      onload="document.getElementById('bonus-illustration-image-{{promotionId}}').style.backgroundImage='unset';"
    />
    <div class="bonus-content">
      <div class="bonus-title">
        <span class="text-ellipsis"> {{Title 1}} </span>
      </div>
      <div class="bonus-bonus">
        <span class="text-ellipsis"> {{Title 2}} </span>
      </div>
      <div class="bonus-description">
        <span class="text-ellipsis"> {{Description}} </span>
      </div>
    </div>

    <!-- Not Yet Opted In -->
    <div class="bonus-button-container opt-in-button-container {{#hideOptIn}}hidden{{/hideOptIn}}">
      <button
        class="template-button bonus-button"
        onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Button 2 - URL - Optin authenticated, not opted in}}',
                      promotionId: {{promotionId}},
                      source: '{{source}}'
                  }
                }
              )
            )"
      >
        <div class="bonus-button-label">
          {{Button 2 - label - authenticated, not opted in}}
        </div>
      </button>
    </div>

    <!-- Opted In --->
    <div class="bonus-button-container decline-opt-in-button-container {{#hideDecline}}hidden{{/hideDecline}}">
      <button
        class="template-button bonus-button"
        onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Button 3 - URL - authenticated, opted in}}',
                      promotionId: {{promotionId}},
                      source: '{{source}}'
                  }
                }
              )
            )"
      >
        <div class="bonus-button-label">
          {{Button 3 - label - authenticated, opted in}}
        </div>
      </button>
    </div>

    <!-- Bonus Terms & Cond. -->
    <div
      class="link-text-container mb-28 mt-16"
      onclick="window.dispatchEvent(
              new window.CustomEvent(
                'globalTemplateEvent',
              {
                  detail: {
                    url: '{{URL - T&C}}',
                    promotionId: {{promotionId}},
                    source: '{{source}}'
                }
              }
            )
          )"
    >
      <div class="link-text">{{Label - T&C}}</div>
    </div>
  </div>
</div>
      `,
  },
  /**
   * Fields
      Image 1
      Title
      Description
      Button - label
      Button - URL
   */
  {
    id: 2,
    contentType: 'Promotion',
    brandId: 3,
    name: 'Header - promotion notification',
    description: 'Promotion Template 2',
    htmlDefinition: `
<div class="promotion-notification-template">
  <img
    src="{{Image 1}}"
    class="promotion-icon"
    alt="{{Title}}"
    height="32"
    width="32"
    onerror="this.onerror=null; this.src='{{promotionIconPlaceholder}}'"
  />
  <div class="flex-col full-width" style="position: relative">
    <span class="promo-heading text-ellipsis">{{Title}}</span>
    <span class="promo-text text-ellipsis">{{Description}}</span>
    <div class="show-more-wrapper">
      <div class="show-more-button-container">
        <button
          class="template-button show-more-button"
          onclick="window.dispatchEvent(
                        new window.CustomEvent(
                          'globalTemplateEvent',
                        {
                            detail: {
                              url: '{{Button - URL}}',
                              promotionId: {{promotionId}},
                              source: '{{source}}'
                        }
                      }
                      )
                    )"
        >
          {{Button - label}}
        </button>
      </div>
    </div>
  </div>
</div>
      `,
  },
  /**
   * Fields
      Title 1
      Title 2
      Description
      Button - label
      Button - URL
   */
  {
    id: 3,
    contentType: 'Promotion',
    brandId: 3,
    name: 'Header - promotion notification - activate',
    description: 'Promotion Template 3',
    htmlDefinition: `
<div class="promotion-notification-activate-template">
  <div class="header-text pr-22">{{Title 1}}</div>
  <div class="flex-col items-center gap-24">
    <div class="flex-col gap-16 items-center mt-16">
      <span class="promotion-title">{{Title 2}}</span>
      <span class="sub promotion-title">{{Description}}</span>
    </div>
    <div class="flex-col gap-2 items-center justify-center">
      <img
        id="promotion-image-id"
        class="promotion-image {{^showImage}}hidden{{/showImage}}"
        src="{{imageUrl}}"
        height="220"
        width="220"
        alt="{{promotionTitle}}"
        onerror="document.getElementById('promotion-image-id').style.display='none';"
      />
      <span class="small promotion-title">{{promotionTitle}}</span>
    </div>
    <div class="flex-col items-center gap-2">
      <span class="sub promotion-title">{{activeUntilText}}</span>
      <div class="flex items-center gap-8 countdown-container">
        <div class="countdown-item flex flex-col gap-2 items-center">
          <span>{{days}}</span>
          <span>d</span>
        </div>
        <div class="countdown-item flex flex-col gap-2 items-center">
          <span>{{hours}}</span>
          <span>h</span>
        </div>
        <div class="countdown-item flex flex-col gap-2 items-center">
          <span>{{minutes}}</span>
          <span>m</span>
        </div>
        <div class="countdown-item flex flex-col gap-2 items-center">
          <span>{{seconds}}</span>
          <span>s</span>
        </div>
      </div>
    </div>
    <div class="flex-col justify-center items-center">
      <div class="activate-button-container">
        <button
          class="template-button activate-button"
          onclick="window.dispatchEvent(
                  new window.CustomEvent(
                    'globalTemplateEvent',
                  {
                      detail: {
                        url: '{{Button - URL}}',
                        promotionId: {{promotionId}},
                        source: '{{source}}'
                    }
                  }
                )
              )"
        >
          {{Button - label}}
        </button>
      </div>
      <div
        class="skip-action-container {{^displaySkip}}hidden{{/displaySkip}}"
        onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{linkSkipUrl}}',
                      promotionId: {{promotionId}},
                      source: '{{source}}'
                  }
                }
              )
            )"
      >
        <span class="skip-action"> {{skipText}} </span>
      </div>
    </div>
  </div>
</div>

      `,
  },
  /**
   * Fields
      Image 1
      Image 1 - URL
      Open URLs in new tab
   */
  {
    id: 4,
    contentType: 'Banner',
    brandId: 3,
    name: 'Content embedded in image - Large',
    description: 'Banner Template 1',
    htmlDefinition: `
<div class="banner-template-image">
  <div class="tile-container flex-row justify-start">
    <div class="tile flex-col justify-center items-start">
      <img
        class="img"
        src="{{Image 1}}"
        onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Image 1 - URL}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
        width="2880"
        height="900"
        fetchpriority="high"
        loading="eager"
      />
    </div>
  </div>
</div>
      `,
  },
  /**
   * Fields
      Image 1
      Image 1 - URL
      Open URLs in new tab
   */
  {
    id: 5,
    contentType: 'Banner',
    brandId: 3,
    name: 'Content embedded in image - Small',
    description: 'Banner Template 2',
    htmlDefinition: `
<div class="banner-template-image small">
  <div class="tile-container flex-row justify-start">
    <div class="tile flex-col justify-start items-center">
      <img
        class="img"
        src="{{Image 1}}"
        onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Image 1 - URL}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
        width="1280"
        height="1644"
        fetchpriority="high"
        loading="eager"
      />
    </div>
  </div>
</div>
      `,
  },
  /**
   * Fields
      Image 1 - background
      Image 1 - URL
      Title 1
      Title 2
      Description 1
      Button 1 - label
      Button 1 - URL
      Open URLs in new tab
   */
  {
    id: 6,
    contentType: 'Banner',
    brandId: 3,
    name: 'Content on the left',
    description: 'Banner Template 3',
    htmlDefinition: `
<div class="banner-template-promotion-left" onclick="
  window.dispatchEvent(
    new window.CustomEvent(
      'globalTemplateEvent',
      {
          detail: {
            url: '{{Image 1 - URL}}',
            {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
            source: '{{source}}'
        }
      }
    )
  );
">
  <div class="banner">
    <img
      alt="banner"
      class="banner-illustration"
      src="{{Image 1 - background}}"
      width="371"
      height="360"
      fetchpriority="high"
      loading="eager"
    />
    <div class="banner-content">
      <span class="banner-title">{{Title 1}}</span>
      <span class="banner-bonus">{{Title 2}}</span>
      <span class="banner-description">{{Description 1}}</span>
      <button
        class="template-button button-larger-text banner-button"
        onclick="event.stopPropagation();
                window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Button 1 - URL}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
      >
        {{Button 1 - label}}
      </button>
    </div>
  </div>
</div>
      `,
  },
  /**
   * Fields
      Image 1 - background
      Image 1 - URL
      Title 1
      Title 2
      Description 1
      Button 1 - label
      Button 1 - URL
      Open URLs in new tab
   */
  {
    id: 7,
    contentType: 'Banner',
    brandId: 3,
    name: 'Content on the right',
    description: 'Banner Template 4',
    htmlDefinition: `
<div class="banner-template-promotion-right" onclick="
  window.dispatchEvent(
    new window.CustomEvent(
      'globalTemplateEvent',
      {
          detail: {
            url: '{{Image 1 - URL}}',
          {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}}
        }
      }
    )
  );
">
  <div class="banner">
    <div class="banner-content">
      <span class="banner-title">{{Title 1}}</span>
      <span class="banner-bonus">{{Title 2}}</span>
      <span class="banner-description">{{Description 1}}</span>
      <button
        class="template-button button-larger-text banner-button"
        onclick="event.stopPropagation();
                window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Button 1 - URL}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
      >
        {{Button 1 - label}}
      </button>
    </div>
    <img
      alt="banner"
      class="banner-illustration"
      src="{{Image 1 - background}}"
      width="371"
      height="360"
      fetchpriority="high"
      loading="eager"
    />
  </div>
</div>

      `,
  },
  /**
   * Fields:
      Image 1 - background
      Image 1 - URL
      Title 1
      Title 2
      Description 1
      Button 1 - label
      Button 1 - URL
      Open URLs in new tab
   */
  {
    id: 8,
    contentType: 'Banner',
    brandId: 3,
    name: 'Content in the middle',
    description: 'Banner Template 5',
    htmlDefinition: `
<div class="banner-template-promotion-middle" onclick="
  window.dispatchEvent(
    new window.CustomEvent(
      'globalTemplateEvent',
      {
          detail: {
            url: '{{Image 1 - URL}}',
            {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
            source: '{{source}}'
        }
      }
    )
  );
">
  <div class="banner">
    <img
      alt="banner"
      class="banner-illustration"
      src="{{Image 1 - background}}"
      width="371"
      height="360"
      fetchpriority="high"
      loading="eager"
    />
    <div class="banner-content">
      <span class="banner-title">{{Title 1}}</span>
      <span class="banner-bonus">{{Title 2}}</span>
      <span class="banner-description">{{Description 1}}</span>
      <button
        class="template-button button-larger-text banner-button"
        onclick="event.stopPropagation();
                window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Button 1 - URL}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            );"
      >
        {{Button 1 - label}}
      </button>
    </div>
  </div>
</div>
      `,
  },
  /**
   * Fields:
      Image 1 - background
      Title 1
      Text 1
      Text 2
      Button 1 - label
      Button 1 - URL
      Link 1 - label
      Link 1 - url
      Open URLs in new tab
   */
  {
    id: 9,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration - Content left',
    description: 'Banner Template 6',
    htmlDefinition: `
    <div class="banner-background-illustration content-left">
      <div class="banner-container absolute">
        <img 
          class="background-image"
          alt="banner"
          src="{{Image 1 - background}}"
          fetchpriority="high"
          loading="eager"
        />
        <div class="banner-content-wrapper absolute">
          <div class="content-container">
            <div class="title">{{Title 1}}</div>
            <div class="subtext-l">{{Text 1}}</div>
            <div class="subtext-s">{{Text 2}}</div>
          </div>
          <div class="cta-container">
            <button class="cta-button" onclick="event.stopPropagation();
                  window.dispatchEvent(
                  new window.CustomEvent(
                    'globalTemplateEvent',
                  {
                      detail: {
                        url: '{{Button 1 - URL}}',
                        {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                        source: '{{source}}'
                    }
                  }
                )
              )"
            >{{Button 1 - label}}</button>
            <div class="cta-text" onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Link 1 - url}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
            >{{Link 1 - label}}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  },
  /**
   * Fields:
      Image 1 - background
      Title 1
      Text 1
      Text 2
      Button 1 - label
      Button 1 - URL
      Link 1 - label
      Link 1 - url
      Open URLs in new tab
   */
  {
    id: 10,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration - Content right',
    description: 'Banner Template 7',
    htmlDefinition: `
    <div class="banner-background-illustration content-right">
      <div class="banner-container absolute">
        <img
          class="background-image"
          alt="banner"
          src="{{Image 1 - background}}"
          fetchpriority="high"
          loading="eager"
        />
        <div class="banner-content-wrapper absolute">
          <div class="content-container">
            <div class="title">{{Title 1}}</div>
            <div class="subtext-l">{{Text 1}}</div>
            <div class="subtext-s">{{Text 2}}</div>
          </div>
          <div class="cta-container">
            <button class="cta-button" onclick="event.stopPropagation();
                  window.dispatchEvent(
                  new window.CustomEvent(
                    'globalTemplateEvent',
                  {
                      detail: {
                        url: '{{Button 1 - URL}}',
                        {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                        source: '{{source}}'
                    }
                  }
                )
              )"
            >{{Button 1 - label}}</button>
            <div class="cta-text" onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Link 1 - url}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
            >{{Link 1 - label}}</div>
          </div>
        </div>
      </div>
    </div>
    `,
  },
  /**
   * Fields:
      Image 1 - background
      Title 1
      Text 1
      Text 2
      Button 1 - label
      Button 1 - URL
      Link 1 - label
      Link 1 - url
      Open URLs in new tab
   */
  {
    id: 11,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration - Content middle',
    description: 'Banner Template 8',
    htmlDefinition: `
    <div class="banner-background-illustration content-middle">
      <div class="banner-container absolute">
        <img 
          class="background-image"
          alt="banner"
          src="{{Image 1 - background}}"
          fetchpriority="high"
          loading="eager"
        />
        <div class="banner-content-wrapper absolute">
          <div class="content-container">
            <div class="title">{{Title 1}}</div>
            <div class="subtext-l">{{Text 1}}</div>
            <div class="subtext-s">{{Text 2}}</div>
          </div>
          <div class="cta-container">
            <button class="cta-button" onclick="event.stopPropagation();
                  window.dispatchEvent(
                  new window.CustomEvent(
                    'globalTemplateEvent',
                  {
                      detail: {
                        url: '{{Button 1 - URL}}',
                        {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                        source: '{{source}}'
                    }
                  }
                )
              )"
            >{{Button 1 - label}}</button>
            <div class="cta-text" onclick="window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Link 1 - url}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
            >{{Link 1 - label}}</div>
          </div>
        </div>
      </div>
    </div>
    `,
  },
  /**
 * Fields:
    Image 1 - background
    Text 1
    Button 1 - label
    Button 1 - URL
    Open URLs in new tab
 */
  {
    id: 12,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration small - Content left',
    description: 'Banner Template 9',
    htmlDefinition: `
    <div class="banner-background-illustration small content-left">
    <div class="banner-container absolute">
      <img 
        class="background-image"
        alt="banner"
        src="{{Image 1 - background}}"
        fetchpriority="high"
        loading="eager"
      />
      <div class="banner-content-wrapper absolute">
        <div class="content-container">
          <div class="content-text">{{Text 1}}</div>
        </div>
        <div class="cta-container">
          <button 
            class="cta-button"
            onclick="event.stopPropagation();
                  window.dispatchEvent(
                  new window.CustomEvent(
                    'globalTemplateEvent',
                  {
                      detail: {
                        url: '{{Button 1 - URL}}',
                        {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                        source: '{{source}}'
                    }
                  }
                )
              )"
          >{{Button 1 - label}}</button>
        </div>
      </div>
    </div>
    </div>
    `,
  },
  /**
* Fields:
  Image 1 - background
  Text 1
  Button 1 - label
  Button 1 - URL
  Open URLs in new tab
*/
  {
    id: 13,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration small - Content left wide',
    description: 'Banner Template 10',
    htmlDefinition: `
    <div class="banner-background-illustration small content-left wide">
    <div class="banner-container absolute">
      <img 
        class="background-image"
        alt="banner"
        src="{{Image 1 - background}}"
        fetchpriority="high"
        loading="eager"
      />
      <div class="banner-content-wrapper absolute">
        <div class="content-container">
          <div class="content-text">{{Text 1}}</div>
        </div>
        <div class="cta-container">
          <button 
            class="cta-button"
            onclick="event.stopPropagation();
                  window.dispatchEvent(
                  new window.CustomEvent(
                    'globalTemplateEvent',
                  {
                      detail: {
                        url: '{{Button 1 - URL}}',
                        {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                        source: '{{source}}'
                    }
                  }
                )
              )"
          >{{Button 1 - label}}</button>
        </div>
      </div>
    </div>
    </div>
      `,
  },
  /**
* Fields:
Image 1 - background
Text 1
Button 1 - label
Button 1 - URL
Open URLs in new tab
*/
  {
    id: 14,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration small - Content right',
    description: 'Banner Template 11',
    htmlDefinition: `
    <div class="banner-background-illustration small content-right">
    <div class="banner-container absolute">
      <img 
        class="background-image"
        alt="banner"
        src="{{Image 1 - background}}"
        fetchpriority="high"
        loading="eager"
      />
      <div class="banner-content-wrapper absolute">
        <div class="content-container">
          <div class="content-text">{{Text 1}}</div>
        </div>
        <div class="cta-container">
          <button 
            class="cta-button"
            onclick="event.stopPropagation();
                  window.dispatchEvent(
                  new window.CustomEvent(
                    'globalTemplateEvent',
                  {
                      detail: {
                        url: '{{Button 1 - URL}}',
                        {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                        source: '{{source}}'
                    }
                  }
                )
              )"
          >{{Button 1 - label}}</button>
        </div>
      </div>
    </div>
    </div>
    `,
  },
  /**
* Fields:
Image 1 - background
Text 1
Button 1 - label
Button 1 - URL
Open URLs in new tab
*/
  {
    id: 15,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration small - Content right wide',
    description: 'Banner Template 12',
    htmlDefinition: `
  <div class="banner-background-illustration small content-right wide">
  <div class="banner-container absolute">
    <img 
      class="background-image"
      alt="banner"
      src="{{Image 1 - background}}"
      fetchpriority="high"
      loading="eager"
    />
    <div class="banner-content-wrapper absolute">
      <div class="content-container">
        <div class="content-text">{{Text 1}}</div>
      </div>
      <div class="cta-container">
        <button 
          class="cta-button"
          onclick="event.stopPropagation();
                window.dispatchEvent(
                new window.CustomEvent(
                  'globalTemplateEvent',
                {
                    detail: {
                      url: '{{Button 1 - URL}}',
                      {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                      source: '{{source}}'
                  }
                }
              )
            )"
        >{{Button 1 - label}}</button>
      </div>
    </div>
  </div>
  </div>
  `,
  },
  /**
 * Fields:
  Image 1 - background
  Redirection 1 - URL
  Open URLs in new tab
*/
  {
    id: 16,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration - Image only',
    description: 'Banner Template 13',
    htmlDefinition: `
    <div class="banner-background-illustration" 
      onclick="
      window.dispatchEvent(
        new window.CustomEvent(
          'globalTemplateEvent',
          {
              detail: {
                url: '{{Redirection 1 - URL}}',
                {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                source: '{{source}}'
            }
          }
        )
      );
    ">
      <div class="banner-container absolute">
        <img 
          class="background-image"
          alt="banner"
          src="{{Image 1 - background}}"
          fetchpriority="high"
          loading="eager"
        />
      </div>
    </div>
  `,
  },
  /**
 * Fields:
Image 1 - background
Redirection 1 - URL
Open URLs in new tab
*/
  {
    id: 17,
    contentType: 'Banner',
    brandId: 3,
    name: 'Background illustration small - Image only',
    description: 'Banner Template 14',
    htmlDefinition: `
    <div class="banner-background-illustration small" 
      onclick="
      window.dispatchEvent(
        new window.CustomEvent(
          'globalTemplateEvent',
          {
              detail: {
                url: '{{Redirection 1 - URL}}',
                {{#Open URLs in new tab}}openInNewWindow: true{{/Open URLs in new tab}},
                source: '{{source}}'
            }
          }
        )
      );
    ">
      <div class="banner-container absolute">
        <img 
          class="background-image"
          alt="banner"
          src="{{Image 1 - background}}"
          fetchpriority="high"
          loading="eager"
        />
      </div>
    </div>
  `,
  },
  /**
* Fields:
CMS configurable:
Image 1
Tag 1 label
Tag 2 label
Main title
Description

non-CMS configurable
Time remaining
Button - URL
Button - Label
*/
  {
    id: 18,
    contentType: 'Bonus',
    brandId: 4,
    name: 'Bonus offering',
    description: 'Bonus Template 1',
    htmlDefinition: `
    <div class="bonus-template bonus-offering">
      <img 
        class="promo-image"
        alt="promo-image"
        src="{{Image 1}}"
        fetchpriority="high"
        loading="eager"
      />
      <div class="content-container">
        <div class="content-wrapper">
          <div class="top-content">
            <div class="tag-container">
            {{#Tag 1 label}}<div class="tag-label">{{Tag 1 label}}</div>{{/Tag 1 label}}
            {{#Tag 2 label}}<div class="tag-label">{{Tag 2 label}}</div>{{/Tag 2 label}}
            </div>
            <div class="timer-container">{{Time remaining}}</div>
          </div>
          <div class="main-content">
            <div class="header-container">
            <div class="main-title">{{Main title}}</div>
            </div>
            <div class="description">
            {{Description}}
            </div>
          </div>
        </div>
        <div class="cta-container">
          <button 
            class="cta-button" 
            translate
            onclick="window.dispatchEvent(
              new window.CustomEvent(
                'globalTemplateEvent',
                {
                  detail: {
                    url: '{{Button - URL}}',
                    bonusId: {{bonusId}},
                    source: '{{source}}'
                  }
                }
              )
            )"
            >
              {{Button - Label}}
            </button>
        </div>
      </div>
    </div>
    `,
  },
  /**
* Fields:
CMS configurable:
Tag 1 label
Tag 2 label
Main title
Condition 1
Condition 2
Condition 3
Condition 4
Condition 5
Condition 6
Button - URL
Button - Label

Non-CMS configurable
Time remaining
Header amount currency
Header amount
Status
Status label
Progress value
*/
  {
    id: 19,
    contentType: 'Bonus',
    brandId: 4,
    name: 'Bonus in progress - active',
    description: 'Bonus Template 2',
    htmlDefinition: `
    <div class="bonus-template bonus-in-progress-active">
      <div class="content-container">
        <div class="content-wrapper">
          <div class="top-content">
            <div class="tag-container">
            {{#Tag 1 label}}<div class="tag-label">{{Tag 1 label}}</div>{{/Tag 1 label}}
            {{#Tag 2 label}}<div class="tag-label">{{Tag 2 label}}</div>{{/Tag 2 label}}
            </div>
            <div class="timer-container">{{Time remaining}}</div>
          </div>
          <div class="main-content">
            <div class="header-container">
            <div class="header-text-wrapper">
              <div class="main-title">{{Main title}}</div>
              <div class="header-amount"><span class="header-amount-currency">{{Header amount currency}}</span>{{Header amount}}</div>
            </div>
            {{#Status}}
            <div class="header-status {{Status}}">
              <span class="status-label">{{Status label}}</span>
            </div>
            {{/Status}}
            </div>
            {{#Progress value}}
            <div class="progress-bar-container">
            <div class="progress-label">{{Progress value}}<span>%</span></div>
            <div class="progress-track-wrapper">
              <div class="progress-track">
              <div class="progress-fill" style="width: {{Progress value}}%;"></div>
              </div>
            </div>
            </div>
            {{/Progress value}}
            <div class="conditions-container">
            <div class="conditions-header" translate>Conditions</div>
            <div class="conditions-wrapper">
              {{#Condition 1}}
              <div class="conditions-line">
              <span class="conditions-dot"></span>
              <div class="conditions-text">{{Condition 1}}</div>
              </div>
              {{/Condition 1}}
              {{#Condition 2}}
              <div class="conditions-line">
              <span class="conditions-dot"></span>
              <div class="conditions-text">{{Condition 2}}</div>
              </div>
              {{/Condition 2}}
              {{#Condition 3}}
              <div class="conditions-line">
              <span class="conditions-dot"></span>
              <div class="conditions-text">{{Condition 3}}</div>
              </div>
              {{/Condition 3}}
              {{#Condition 4}}
              <div class="conditions-line">
              <span class="conditions-dot"></span>
              <div class="conditions-text">{{Condition 4}}</div>
              </div>
              {{/Condition 4}}
              {{#Condition 5}}
              <div class="conditions-line">
              <span class="conditions-dot"></span>
              <div class="conditions-text">{{Condition 5}}</div>
              </div>
              {{/Condition 5}}
              {{#Condition 6}}
              <div class="conditions-line">
              <span class="conditions-dot"></span>
              <div class="conditions-text">{{Condition 6}}</div>
              </div>
              {{/Condition 6}}
            </div>
            </div>
          </div>
        </div>
        <div class="cta-container">
          <button 
            class="cta-button" 
            onclick="window.dispatchEvent(
              new window.CustomEvent(
                'globalTemplateEvent',
                {
                  detail: {
                    url: '{{Button - URL}}',
                  }
                }
              )
            )"
            >
              {{Button - Label}}
            </button>
        </div>
      </div>
    </div>
  `,
  },
  /**
* Fields:
CMS configurable:
Image 1
Tag 1 label
Tag 2 label
Main title
Description
Button - URL
Button - Label

non-CMS configurable
Time remaining
*/
  {
    id: 20,
    contentType: 'Banner',
    brandId: 4,
    name: 'Banner offering',
    description: 'Banner Template 1',
    htmlDefinition: `
    <div class="promotion-banner-template banner-offering">
      <img 
        class="promo-image"
        alt="promo-image"
        src="{{Image 1}}"
        fetchpriority="high"
        loading="eager"
      />
      <div class="content-container">
        <div class="content-wrapper">
          <div class="top-content">
            <div class="tag-container">
            {{#Tag 1 label}}<div class="tag-label">{{Tag 1 label}}</div>{{/Tag 1 label}}
            {{#Tag 2 label}}<div class="tag-label">{{Tag 2 label}}</div>{{/Tag 2 label}}
            </div>
            <div class="timer-container">{{Time remaining}}</div>
          </div>
          <div class="main-content">
            <div class="header-container">
            <div class="main-title">{{Main title}}</div>
            </div>
            <div class="description">
            {{Description}}
            </div>
          </div>
        </div>
        <div class="cta-container">
          <button 
            class="cta-button" 
            onclick="window.dispatchEvent(
              new window.CustomEvent(
                'globalTemplateEvent',
                {
                  detail: {
                    url: '{{Button - URL}}'
                  }
                }
              )
            )"
            >
              {{Button - Label}}
            </button>
          </div>
      </div>
    </div>
  `,
  },
];
