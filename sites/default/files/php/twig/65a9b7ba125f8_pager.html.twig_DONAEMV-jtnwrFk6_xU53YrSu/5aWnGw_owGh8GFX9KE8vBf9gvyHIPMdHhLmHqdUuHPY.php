<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* core/themes/olivero/templates/navigation/pager.html.twig */
class __TwigTemplate_96da370107ef20dc639622cc41192664 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $this->checkSecurity();
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 34
        if (($context["items"] ?? null)) {
            // line 35
            echo "  <nav class=\"pager layout--content-medium\" role=\"navigation\" aria-labelledby=\"";
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["heading_id"] ?? null), 35, $this->source), "html", null, true);
            echo "\">
    <";
            // line 36
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["pagination_heading_level"] ?? null), 36, $this->source), "html", null, true);
            echo " id=\"";
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["heading_id"] ?? null), 36, $this->source), "html", null, true);
            echo "\" class=\"visually-hidden\">";
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Pagination"));
            echo "</";
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["pagination_heading_level"] ?? null), 36, $this->source), "html", null, true);
            echo ">
    <ul class=\"pager__items js-pager__items\">
      ";
            // line 39
            echo "      ";
            if (twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "first", [], "any", false, false, true, 39)) {
                // line 40
                echo "        ";
                ob_start(function () { return ''; });
                // line 41
                echo "          <li class=\"pager__item pager__item--control pager__item--first\">
            <a href=\"";
                // line 42
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "first", [], "any", false, false, true, 42), "href", [], "any", false, false, true, 42), 42, $this->source), "html", null, true);
                echo "\" title=\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Go to first page"));
                echo "\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $this->extensions['Drupal\Core\Template\TwigExtension']->withoutFilter($this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "first", [], "any", false, false, true, 42), "attributes", [], "any", false, false, true, 42), 42, $this->source), "href", "title"), "addClass", ["pager__link"], "method", false, false, true, 42), 42, $this->source), "html", null, true);
                echo ">
              <span class=\"visually-hidden\">";
                // line 43
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("First page"));
                echo "</span>
              ";
                // line 44
                $this->loadTemplate("@olivero/../images/pager-first.svg", "core/themes/olivero/templates/navigation/pager.html.twig", 44)->display($context);
                // line 45
                echo "            </a>
          </li>
        ";
                $___internal_parse_0_ = ('' === $tmp = ob_get_clean()) ? '' : new Markup($tmp, $this->env->getCharset());
                // line 40
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(twig_spaceless($___internal_parse_0_));
                // line 48
                echo "      ";
            }
            // line 49
            echo "
      ";
            // line 51
            echo "      ";
            if (twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "previous", [], "any", false, false, true, 51)) {
                // line 52
                echo "        ";
                ob_start(function () { return ''; });
                // line 53
                echo "          <li class=\"pager__item pager__item--control pager__item--previous\">
            <a href=\"";
                // line 54
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "previous", [], "any", false, false, true, 54), "href", [], "any", false, false, true, 54), 54, $this->source), "html", null, true);
                echo "\" title=\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Go to previous page"));
                echo "\" rel=\"prev\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $this->extensions['Drupal\Core\Template\TwigExtension']->withoutFilter($this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "previous", [], "any", false, false, true, 54), "attributes", [], "any", false, false, true, 54), 54, $this->source), "href", "title", "rel"), "addClass", ["pager__link"], "method", false, false, true, 54), 54, $this->source), "html", null, true);
                echo ">
              <span class=\"visually-hidden\">";
                // line 55
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Previous page"));
                echo "</span>
              ";
                // line 56
                $this->loadTemplate("@olivero/../images/pager-previous.svg", "core/themes/olivero/templates/navigation/pager.html.twig", 56)->display($context);
                // line 57
                echo "            </a>
          </li>
        ";
                $___internal_parse_1_ = ('' === $tmp = ob_get_clean()) ? '' : new Markup($tmp, $this->env->getCharset());
                // line 52
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(twig_spaceless($___internal_parse_1_));
                // line 60
                echo "      ";
            }
            // line 61
            echo "
      ";
            // line 63
            echo "      ";
            if (twig_get_attribute($this->env, $this->source, ($context["ellipses"] ?? null), "previous", [], "any", false, false, true, 63)) {
                // line 64
                echo "        <li class=\"pager__item pager__item--ellipsis\" role=\"presentation\">&hellip;</li>
      ";
            }
            // line 66
            echo "
      ";
            // line 68
            echo "      ";
            $context['_parent'] = $context;
            $context['_seq'] = twig_ensure_traversable(twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "pages", [], "any", false, false, true, 68));
            foreach ($context['_seq'] as $context["key"] => $context["item"]) {
                // line 69
                echo "        ";
                ob_start(function () { return ''; });
                // line 70
                echo "          <li class=\"pager__item";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar((((($context["current"] ?? null) == $context["key"])) ? (" pager__item--active") : ("")));
                echo " pager__item--number\">
            ";
                // line 71
                if ((($context["current"] ?? null) == $context["key"])) {
                    // line 72
                    echo "              ";
                    $context["title"] = t("Current page");
                    // line 73
                    echo "            ";
                } else {
                    // line 74
                    echo "              ";
                    $context["title"] = t("Go to page @key", ["@key" => $context["key"]]);
                    // line 75
                    echo "            ";
                }
                // line 76
                echo "            ";
                if ((($context["current"] ?? null) != $context["key"])) {
                    // line 77
                    echo "              <a href=\"";
                    echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["item"], "href", [], "any", false, false, true, 77), 77, $this->source), "html", null, true);
                    echo "\" title=\"";
                    echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["title"] ?? null), 77, $this->source), "html", null, true);
                    echo "\"";
                    echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $this->extensions['Drupal\Core\Template\TwigExtension']->withoutFilter($this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["item"], "attributes", [], "any", false, false, true, 77), 77, $this->source), "href", "title"), "addClass", ["pager__link", (((($context["current"] ?? null) == $context["key"])) ? (" is-active") : (""))], "method", false, false, true, 77), 77, $this->source), "html", null, true);
                    echo ">
            ";
                }
                // line 79
                echo "            <span class=\"visually-hidden\">
              ";
                // line 80
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar((((($context["current"] ?? null) == $context["key"])) ? (t("Current page")) : (t("Page"))));
                echo "
            </span>
            ";
                // line 82
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($context["key"], 82, $this->source), "html", null, true);
                echo "
            ";
                // line 83
                if ((($context["current"] ?? null) != $context["key"])) {
                    // line 84
                    echo "              </a>
            ";
                }
                // line 86
                echo "          </li>
        ";
                $___internal_parse_2_ = ('' === $tmp = ob_get_clean()) ? '' : new Markup($tmp, $this->env->getCharset());
                // line 69
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(twig_spaceless($___internal_parse_2_));
                // line 88
                echo "      ";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['key'], $context['item'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 89
            echo "
      ";
            // line 91
            echo "      ";
            if (twig_get_attribute($this->env, $this->source, ($context["ellipses"] ?? null), "next", [], "any", false, false, true, 91)) {
                // line 92
                echo "        <li class=\"pager__item pager__item--ellipsis\" role=\"presentation\">&hellip;</li>
      ";
            }
            // line 94
            echo "
      ";
            // line 96
            echo "      ";
            if (twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "next", [], "any", false, false, true, 96)) {
                // line 97
                echo "        ";
                ob_start(function () { return ''; });
                // line 98
                echo "          <li class=\"pager__item pager__item--control pager__item--next\">
            <a href=\"";
                // line 99
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "next", [], "any", false, false, true, 99), "href", [], "any", false, false, true, 99), 99, $this->source), "html", null, true);
                echo "\" title=\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Go to next page"));
                echo "\" rel=\"next\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $this->extensions['Drupal\Core\Template\TwigExtension']->withoutFilter($this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "next", [], "any", false, false, true, 99), "attributes", [], "any", false, false, true, 99), 99, $this->source), "href", "title", "rel"), "addClass", ["pager__link"], "method", false, false, true, 99), 99, $this->source), "html", null, true);
                echo ">
              <span class=\"visually-hidden\">";
                // line 100
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Next page"));
                echo "</span>
              ";
                // line 101
                $this->loadTemplate("@olivero/../images/pager-previous.svg", "core/themes/olivero/templates/navigation/pager.html.twig", 101)->display($context);
                // line 102
                echo "            </a>
          </li>
        ";
                $___internal_parse_3_ = ('' === $tmp = ob_get_clean()) ? '' : new Markup($tmp, $this->env->getCharset());
                // line 97
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(twig_spaceless($___internal_parse_3_));
                // line 105
                echo "      ";
            }
            // line 106
            echo "
      ";
            // line 108
            echo "      ";
            if (twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "last", [], "any", false, false, true, 108)) {
                // line 109
                echo "        ";
                ob_start(function () { return ''; });
                // line 110
                echo "          <li class=\"pager__item pager__item--control pager__item--last\">
            <a href=\"";
                // line 111
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "last", [], "any", false, false, true, 111), "href", [], "any", false, false, true, 111), 111, $this->source), "html", null, true);
                echo "\" title=\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Go to last page"));
                echo "\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $this->extensions['Drupal\Core\Template\TwigExtension']->withoutFilter($this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, ($context["items"] ?? null), "last", [], "any", false, false, true, 111), "attributes", [], "any", false, false, true, 111), 111, $this->source), "href", "title"), "addClass", ["pager__link"], "method", false, false, true, 111), 111, $this->source), "html", null, true);
                echo ">
              <span class=\"visually-hidden\">";
                // line 112
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(t("Last page"));
                echo "</span>
              ";
                // line 113
                $this->loadTemplate("@olivero/../images/pager-first.svg", "core/themes/olivero/templates/navigation/pager.html.twig", 113)->display($context);
                // line 114
                echo "            </a>
          </li>
        ";
                $___internal_parse_4_ = ('' === $tmp = ob_get_clean()) ? '' : new Markup($tmp, $this->env->getCharset());
                // line 109
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(twig_spaceless($___internal_parse_4_));
                // line 117
                echo "      ";
            }
            // line 118
            echo "    </ul>
  </nav>
";
        }
        $this->env->getExtension('\Drupal\Core\Template\TwigExtension')
            ->checkDeprecations($context, ["items", "heading_id", "pagination_heading_level", "ellipses", "current"]);    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "core/themes/olivero/templates/navigation/pager.html.twig";
    }

    /**
     * @codeCoverageIgnore
     */
    public function isTraitable()
    {
        return false;
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo()
    {
        return array (  291 => 118,  288 => 117,  286 => 109,  281 => 114,  279 => 113,  275 => 112,  267 => 111,  264 => 110,  261 => 109,  258 => 108,  255 => 106,  252 => 105,  250 => 97,  245 => 102,  243 => 101,  239 => 100,  231 => 99,  228 => 98,  225 => 97,  222 => 96,  219 => 94,  215 => 92,  212 => 91,  209 => 89,  203 => 88,  201 => 69,  197 => 86,  193 => 84,  191 => 83,  187 => 82,  182 => 80,  179 => 79,  169 => 77,  166 => 76,  163 => 75,  160 => 74,  157 => 73,  154 => 72,  152 => 71,  147 => 70,  144 => 69,  139 => 68,  136 => 66,  132 => 64,  129 => 63,  126 => 61,  123 => 60,  121 => 52,  116 => 57,  114 => 56,  110 => 55,  102 => 54,  99 => 53,  96 => 52,  93 => 51,  90 => 49,  87 => 48,  85 => 40,  80 => 45,  78 => 44,  74 => 43,  66 => 42,  63 => 41,  60 => 40,  57 => 39,  46 => 36,  41 => 35,  39 => 34,);
    }

    public function getSourceContext()
    {
        return new Source("", "core/themes/olivero/templates/navigation/pager.html.twig", "/Users/joco/dev/chickenloop-git/core/themes/olivero/templates/navigation/pager.html.twig");
    }
    
    public function checkSecurity()
    {
        static $tags = array("if" => 34, "apply" => 40, "include" => 44, "for" => 68, "set" => 72);
        static $filters = array("escape" => 35, "t" => 36, "without" => 42, "spaceless" => 40);
        static $functions = array();

        try {
            $this->sandbox->checkSecurity(
                ['if', 'apply', 'include', 'for', 'set'],
                ['escape', 't', 'without', 'spaceless'],
                []
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->source);

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }
}
