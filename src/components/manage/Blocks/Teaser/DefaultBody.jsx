import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Message } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers';
import { getTeaserImageURL } from './utils';
import { getContent } from '@plone/volto/actions';
import { MaybeWrap } from '@plone/volto/components';
import { UniversalLink } from '@plone/volto/components';
import cx from 'classnames';
import config from '@plone/volto/registry';

const messages = defineMessages({
  PleaseChooseContent: {
    id: 'Please choose an existing content as source for this element',
    defaultMessage: 'Please choose an existing content as source for this element',
  },
});

const DefaultImage = (props) => <img {...props} alt={props.alt || ''} />;

const TeaserDefaultTemplate = (props) => {
  const { className, data, isEditMode, id } = props;
  const dispatch = useDispatch();
  const intl = useIntl();
  const href = data.href?.[0];
  const image = data.preview_image?.[0];
  const align = data?.styles?.align;

  const hasImageComponent = config.getComponent('Image').component;
  const Image = config.getComponent('Image').component || DefaultImage;
  const { openExternalLinkInNewTab } = config.settings;
  const defaultImageSrc = href && flattenToAppURL(getTeaserImageURL({ href, image, align }));

  const result = useSelector((state) => state?.content?.subrequests?.[id]?.data);

  useEffect(() => {
    if (href && !data.overwrite) {
      dispatch(getContent(flattenToAppURL(href['@id']), null, id));
    }
  }, [data.overwrite]);

  return (
    <div className={cx('block teaser', className)}>
      <>
        {!href && isEditMode && (
          <Message>
            <div className="teaser-item placeholder">
              <img src={imageBlockSVG} alt="" />
              <p>{intl.formatMessage(messages.PleaseChooseContent)}</p>
            </div>
          </Message>
        )}
        {!data.overwrite && result && (
          <MaybeWrap condition={!isEditMode} as={UniversalLink} href={href['@id']} target={data.openLinkInNewTab || (openExternalLinkInNewTab && !isInternalURL(href['@id'])) ? '_blank' : null}>
            <div className="teaser-item default">
              {(result.hasPreviewImage || result.image_field || result.preview_image) && (
                <div className="image-wrapper">
                  <Image src={result?.preview_image ? flattenToAppURL(result.preview_image.scales.teaser.download) : result?.image ? flattenToAppURL(result.image.scales.teaser.download) : placeholderIMG} alt="" loading="lazy" />
                </div>
              )}
              <div className="content">
                {result?.head_title && <div className="headline">{result.head_title}</div>}
                <h2>{result?.title}</h2>
                {!result.hide_description && <p>{result?.description}</p>}
              </div>
            </div>
          </MaybeWrap>
        )}
        {href && data.overwrite && (
          <MaybeWrap condition={!isEditMode} as={UniversalLink} href={href['@id']} target={data.openLinkInNewTab || (openExternalLinkInNewTab && !isInternalURL(href['@id'])) ? '_blank' : null}>
            <div className="teaser-item default">
              {(href.hasPreviewImage || href.image_field || image) && (
                <div className="image-wrapper">
                  <Image src={hasImageComponent ? href : defaultImageSrc} alt="" loading="lazy" />
                </div>
              )}
              <div className="content">
                {data?.head_title && <div className="headline">{data.head_title}</div>}
                <h2>{data?.title}</h2>
                {!data.hide_description && <p>{data?.description}</p>}
              </div>
            </div>
          </MaybeWrap>
        )}
      </>
    </div>
  );
};

TeaserDefaultTemplate.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  isEditMode: PropTypes.bool,
};

export default TeaserDefaultTemplate;
