import React, { useEffect } from 'react'

import Textarea from 'decentraland-gatsby/dist/components/Form/Textarea'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import { TeamMember, TeamMemberItemSchema } from '../../entities/Grant/types'
import Label from '../Common/Label'
import { ContentSection } from '../Layout/ContentLayout'

import AddModal from './AddModal'
import './AddModal.css'

export const INITIAL_TEAM_MEMBER_ITEM: TeamMember = {
  name: '',
  role: '',
  about: '',
  relevantLink: '',
}

const schema = TeamMemberItemSchema
const validate = createValidator<TeamMember>({
  name: (state) => ({
    name:
      assert(state.name.length <= schema.name.maxLength, 'error.grant.personnel.name_too_large') ||
      assert(state.name.length > 0, 'error.grant.personnel.name_empty') ||
      assert(state.name.length >= schema.name.minLength, 'error.grant.personnel.name_too_short') ||
      undefined,
  }),
  role: (state) => ({
    role:
      assert(state.role.length <= schema.role.maxLength, 'error.grant.personnel.role_too_large') ||
      assert(state.role.length > 0, 'error.grant.personnel.role_empty') ||
      assert(state.role.length >= schema.role.minLength, 'error.grant.personnel.role_too_short') ||
      undefined,
  }),
  about: (state) => ({
    about:
      assert(state.about.length <= schema.about.maxLength, 'error.grant.personnel.about_too_large') ||
      assert(state.about.length > 0, 'error.grant.personnel.about_empty') ||
      assert(state.about.length >= schema.about.minLength, 'error.grant.personnel.about_too_short') ||
      undefined,
  }),
})

const edit = (state: TeamMember, props: Partial<TeamMember>) => {
  return {
    ...state,
    ...props,
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (item: TeamMember) => void
}

const AddTeamMemberModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const t = useFormatMessage()
  const [state, editor] = useEditor(edit, validate, INITIAL_TEAM_MEMBER_ITEM)

  useEffect(() => {
    if (state.validated) {
      onSubmit(state.value)
      onClose()
      editor.set(INITIAL_TEAM_MEMBER_ITEM)
    }
  }, [editor, onClose, onSubmit, state.validated, state.value])

  return (
    <AddModal
      title={t('page.submit_grant.personnel.team_modal.title')}
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryClick={() => editor.validate()}
    >
      <div>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.personnel.team_modal.name_label')}</Label>
          <Field
            value={state.value.name}
            placeholder={t('page.submit_grant.personnel.team_modal.name_placeholder')}
            onChange={(_, { value }) => editor.set({ name: value })}
            error={!!state.error.name}
            message={
              t(state.error.name) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.name.length,
                limit: schema.name.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.personnel.team_modal.role_label')}</Label>
          <Field
            value={state.value.role}
            placeholder={t('page.submit_grant.personnel.team_modal.role_placeholder')}
            onChange={(_, { value }) => editor.set({ role: value })}
            error={!!state.error.role}
            message={
              t(state.error.role) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.role.length,
                limit: schema.role.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.personnel.team_modal.about_label')}</Label>
          <Textarea
            value={state.value.about}
            minHeight={175}
            placeholder={t('page.submit_grant.personnel.team_modal.about_placeholder')}
            onChange={(_: unknown, { value }: { value: string }) => editor.set({ about: String(value) })}
            error={!!state.error.about}
            message={
              t(state.error.about) +
              ' ' +
              t('page.submit.character_counter', {
                current: state.value.about.length,
                limit: schema.about.maxLength,
              })
            }
          />
        </ContentSection>
        <ContentSection className="GrantRequestSection__Field">
          <Label>{t('page.submit_grant.personnel.team_modal.relevant_link_label')}</Label>
          <Field
            value={state.value.relevantLink}
            placeholder={t('page.submit_grant.personnel.team_modal.relevant_link_placeholder')}
            onChange={(_, { value }) => editor.set({ relevantLink: value })}
          />
        </ContentSection>
      </div>
    </AddModal>
  )
}

export default AddTeamMemberModal