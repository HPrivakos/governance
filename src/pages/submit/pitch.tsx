import React, { useEffect, useMemo, useRef, useState } from 'react'
import Helmet from 'react-helmet'
import { SubmitHandler, useForm } from 'react-hook-form'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { Governance } from '../../clients/Governance'
import Field from '../../components/Common/Form/Field'
import MarkdownField from '../../components/Common/Form/MarkdownField'
import ErrorMessage from '../../components/Error/ErrorMessage'
import MarkdownNotice from '../../components/Form/MarkdownNotice'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import CoAuthors from '../../components/Proposal/Submit/CoAuthor/CoAuthors'
import LogIn from '../../components/User/LogIn'
import { SUBMISSION_THRESHOLD_PITCH } from '../../entities/Proposal/constants'
import { NewProposalPitch, newProposalPitchScheme } from '../../entities/Proposal/types'
import useVotingPowerDistribution from '../../hooks/useVotingPowerDistribution'
import locations from '../../utils/locations'

import './submit.css'

const initialState: NewProposalPitch = {
  initiative_name: '',
  target_audience: '',
  problem_statement: '',
  proposed_solution: '',
  relevance: '',
}
const schema = newProposalPitchScheme.properties

export default function SubmitPitchProposal() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(account)
  const submissionVpNotMet = useMemo(
    () => !!vpDistribution && vpDistribution.total < Number(SUBMISSION_THRESHOLD_PITCH),
    [vpDistribution]
  )
  const [formDisabled, setFormDisabled] = useState(false)
  const preventNavigation = useRef(false)
  const [error, setError] = useState('')

  const {
    handleSubmit,
    formState: { isDirty, errors },
    control,
    setValue,
    watch,
  } = useForm<NewProposalPitch>({ defaultValues: initialState, mode: 'onTouched' })

  const setCoAuthors = (addresses?: string[]) => setValue('coAuthors', addresses)

  useEffect(() => {
    preventNavigation.current = isDirty
  }, [isDirty])

  const onSubmit: SubmitHandler<NewProposalPitch> = async (data) => {
    setFormDisabled(true)

    try {
      const proposal = await Governance.get().createProposalPitch({
        ...data,
      })

      navigate(locations.proposal(proposal.id, { new: 'true' }), {
        replace: true,
      })
    } catch (error: any) {
      setError(error.body?.error || error.message)
      setFormDisabled(false)
    }
  }

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={t('page.submit_pitch.title') || ''} description={t('page.submit_pitch.description') || ''} />
  }

  return (
    <ContentLayout small preventNavigation={preventNavigation.current}>
      <Head
        title={t('page.submit_pitch.title') || ''}
        description={t('page.submit_pitch.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={t('page.submit_pitch.title') || ''} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentSection>
          <Header size="huge">{t('page.submit_pitch.title')}</Header>
        </ContentSection>
        <ContentSection className="MarkdownSection--tiny">
          <Markdown>{t('page.submit_pitch.description')}</Markdown>
        </ContentSection>

        <ContentSection>
          <Label>
            {t('page.submit_pitch.initiative_name_label')}
            <MarkdownNotice />
          </Label>
          <Field
            control={control}
            name="initiative_name"
            rules={{
              required: { value: true, message: t('error.pitch.initiative_name_empty') },
              min: { value: schema.initiative_name.minLength, message: t('error.pitch.initiative_name_too_short') },
              max: { value: schema.initiative_name.maxLength, message: t('error.pitch.initiative_name_too_long') },
            }}
            error={!!errors.initiative_name}
            loading={isLoadingVpDistribution}
            disabled={submissionVpNotMet || formDisabled}
            message={
              (errors.initiative_name?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('initiative_name').length,
                limit: schema.initiative_name.maxLength,
              })
            }
          />
          <span className="Input__PostLabel">{t('page.submit_pitch.initiative_name_postlabel')}</span>
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.target_audience_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.target_audience_detail')}
          </Paragraph>
          <MarkdownField
            control={control}
            name="target_audience"
            rules={{
              required: { value: true, message: t('error.pitch.target_audience_empty') },
              minLength: {
                value: schema.target_audience.minLength,
                message: t('error.pitch.target_audience_too_short'),
              },
              maxLength: {
                value: schema.target_audience.maxLength,
                message: t('error.pitch.target_audience_too_large'),
              },
            }}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.target_audience}
            message={
              (errors.target_audience?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('target_audience').length,
                limit: schema.target_audience.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.problem_statement_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.problem_statement_detail')}
          </Paragraph>
          <MarkdownField
            control={control}
            name="problem_statement"
            rules={{
              required: { value: true, message: t('error.pitch.problem_statement_empty') },
              minLength: {
                value: schema.problem_statement.minLength,
                message: t('error.pitch.problem_statement_too_short'),
              },
              maxLength: {
                value: schema.problem_statement.maxLength,
                message: t('error.pitch.problem_statement_too_large'),
              },
            }}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.problem_statement}
            message={
              (errors.problem_statement?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('problem_statement').length,
                limit: schema.problem_statement.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.proposed_solution_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.proposed_solution_detail')}
          </Paragraph>
          <MarkdownField
            control={control}
            name="proposed_solution"
            rules={{
              required: { value: true, message: t('error.pitch.proposed_solution_empty') },
              minLength: {
                value: schema.proposed_solution.minLength,
                message: t('error.pitch.proposed_solution_too_short'),
              },
              maxLength: {
                value: schema.proposed_solution.maxLength,
                message: t('error.pitch.proposed_solution_too_large'),
              },
            }}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.proposed_solution}
            message={
              (errors.proposed_solution?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('proposed_solution').length,
                limit: schema.proposed_solution.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <Label>
            {t('page.submit_pitch.relevance_label')}
            <MarkdownNotice />
          </Label>
          <Paragraph tiny secondary className="details">
            {t('page.submit_pitch.relevance_detail')}
          </Paragraph>
          <MarkdownField
            control={control}
            name="relevance"
            rules={{
              required: { value: true, message: t('error.pitch.relevance_empty') },
              minLength: {
                value: schema.relevance.minLength,
                message: t('error.pitch.relevance_too_short'),
              },
              maxLength: {
                value: schema.relevance.maxLength,
                message: t('error.pitch.relevance_too_large'),
              },
            }}
            disabled={submissionVpNotMet || formDisabled}
            error={!!errors.relevance}
            message={
              (errors.relevance?.message || '') +
              ' ' +
              t('page.submit.character_counter', {
                current: watch('relevance').length,
                limit: schema.relevance.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection>
          <CoAuthors setCoAuthors={setCoAuthors} isDisabled={submissionVpNotMet || formDisabled} />
        </ContentSection>
        <ContentSection>
          <Button type="submit" primary loading={formDisabled} disabled={formDisabled}>
            {t('page.submit.button_submit')}
          </Button>
        </ContentSection>
        {submissionVpNotMet && (
          <ContentSection>
            <Paragraph small primary>
              {t('error.pitch.submission_vp_not_met')}
            </Paragraph>
          </ContentSection>
        )}
        {error && (
          <ContentSection>
            <ErrorMessage label={t('page.submit.error_label')} errorMessage={t(error) || error} />
          </ContentSection>
        )}
      </form>
    </ContentLayout>
  )
}
