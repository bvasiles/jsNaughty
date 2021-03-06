from django import forms
from django.core.validators import MaxLengthValidator
#from django.utils.safestring import mark_safe
#from crispy_forms.helper import FormHelper
#from crispy_forms.layout import Layout, Fieldset, ButtonHolder, Submit


#From http://stackoverflow.com/questions/5935546/align-radio-buttons-horizontally-in-django-forms
#class HorizontalRadioRenderer(forms.RadioSelect.renderer):
#    def render(self):
#        return mark_safe(u'\n'.join([u'%s\n' % w for w in self]))

EXAMPLES = (
    ("EX1", 'Example 1'),
)

EX_TEXT = open("deobfuscate/web_examples/paper_ex.min.js", 'r').read()

class JSForm(forms.Form):
    #in_text = forms.Textarea(label = "Obfuscated Text")
    #in_text = forms.CharField(widget=forms.Textarea)
    in_text = forms.CharField(widget=forms.Textarea(attrs={'class' : 'inline-txtarea'}), initial=EX_TEXT, label = "", validators=[MaxLengthValidator(10000)])
    #in_text = forms.CharField(widget=forms.Textarea(attrs={'class' : 'inline-txtarea', 'placeholder' : 'Enter your Javascript Here.'}), label = "", validators=[MaxLengthValidator(10000)])
    mix_jsnice = forms.ChoiceField(widget=forms.RadioSelect, label = "<a href=\"http://jsnice.org\">JSNice Mixing</a>", choices =(('Y', 'Enable (Best Results)'), ('N', 'Disable')), initial='Y')
    #mix_jsnice = forms.ChoiceField(widget=forms.RadioSelect(renderer=HorizontalRadioRenderer), label = "JSNice Mixing", choices =(('Y', 'Enable (Best Results)'), ('N', 'Disable')), initial='Y')

#    def __init__(self, *args, **kwargs):
#        self.helper = FormHelper()
#        self.helper.layout = Layout(
#            ButtonHolder(
#                Submit('submit', 'Submit', css_class='button white')
#            )
#        )
#        super(JSForm, self).__init__(*args, **kwargs)

class JSMinForm(forms.Form):
    in_text = forms.CharField(widget=forms.Textarea(attrs={'class' : 'inline-txtarea', 'placeholder' : 'Enter your Javascript here.'}), label = "", validators=[MaxLengthValidator(10000)])

class JSMinErrorForm(forms.Form):
    in_text = forms.CharField(widget=forms.Textarea(attrs={'class' : 'inline-txtarea'}), initial = "(Error) Minifier failed.  Make sure your Javascript is valid.", label = "", validators=[MaxLengthValidator(10000)])


class LastJSInvalidForm(forms.Form):
    '''
    Used as alternate form for when the past Javascript entered failed
    the pre or post processing.
    '''
    in_text = forms.CharField(widget=forms.Textarea(attrs={'class' : 'inline-txtarea'}), initial='(Error) Please enter valid javascript.', label = "", validators=[MaxLengthValidator(10000)])
    mix_jsnice = forms.ChoiceField(widget=forms.RadioSelect, label = "<a href=\"http://jsnice.org\">JSNice Mixing</a>", choices =(('Y', 'Enable (Best Results)'), ('N', 'Disable')), initial='Y')
    
class ServerErrorForm(forms.Form):
    '''
    Used as alternate form for when the moses server is offline or 
    otherwise failed.
    '''
    in_text = forms.CharField(widget=forms.Textarea(attrs={'class' : 'inline-txtarea'}), initial='(Error) Sorry, internal server is either offline or not functioning.', label = "", validators=[MaxLengthValidator(10000)])
    mix_jsnice = forms.ChoiceField(widget=forms.RadioSelect, label = "<a href=\"http://jsnice.org\">JSNice Mixing</a>", choices =(('Y', 'Enable (Best Results)'), ('N', 'Disable')), initial='Y')
