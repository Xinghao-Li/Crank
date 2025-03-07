import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt

from .misc import get_roc_info, get_pr_info
import csv

# plot
plt.style.use('fivethirtyeight')
plt.rcParams['axes.facecolor'] = 'w'
plt.rcParams['figure.facecolor'] = 'w'
plt.rcParams['savefig.facecolor'] = 'w'

def plot_roc(ax, y_true_all, scores_all, save_path, csv_path=None):

    # calculate ROCs
    roc_info = get_roc_info(y_true_all, scores_all)

    # plot
    _plot_curve(
        curve = 'roc',
        **roc_info,
        ax = ax,
        color = 'C0',
        hatch = None,
        alpha = .2, 
        line = '-',
        title = 'ROC',
        save_path = save_path
    )
    # Save ROC data to CSV if csv_path is provided
    if csv_path:
        save_curve_to_csv('roc', roc_info, csv_path)


def plot_pr(ax, y_true_all, scores_all,save_path,csv_path):

    # calculate ROCs
    roc_info = get_pr_info(y_true_all, scores_all)

    # plot
    _plot_curve(
        curve = 'pr',
        **roc_info,
        ax = ax,
        color = 'C0',
        hatch = None,
        alpha = .2, 
        line = '-',
        title = 'PR',
        save_path = save_path
    )
    # Save PR data to CSV if csv_path is provided
    if csv_path:
        save_curve_to_csv('pr', roc_info, csv_path)

    

def _plot_curve(curve, xs, ys_mean, ys_upper, ys_lower, auc_mean, auc_std, ax, color, hatch, alpha, line, title,save_path):

    assert curve in ['roc', 'pr']

    if curve == 'roc':
        ys_mean = ys_mean[::-1]
        ys_upper = ys_upper[::-1]
        ys_lower = ys_lower[::-1]
        xlabel, ylabel = 'Specificity', 'Sensitivity'

    else:
        xlabel, ylabel = 'Recall', 'Precision'

    p_mean, = ax.plot(
        xs, ys_mean, color=color,
        linestyle=line,
        lw=1.5, alpha=1
    )

    if hatch:
        p_fill = ax.fill_between(
            xs, ys_lower, ys_upper,
            alpha=alpha,
            facecolor='none',
            edgecolor=color,
            hatch=hatch
        )

    else:
        p_fill = ax.fill_between(
            xs, ys_lower, ys_upper,
            alpha=alpha,
            color=color
        )

    ax.set_xlim([-0.05, 1.05])
    ax.set_ylim([-0.05, 1.05])
    ax.set_xlabel(xlabel, fontweight='bold')
    ax.xaxis.set_label_coords(0.5, -0.01)
    ax.set_ylabel(ylabel, fontweight='bold')
    ax.yaxis.set_label_coords(-0.01, 0.5)
    ax.set_title(title, fontweight='bold')
    ax.set_xticks([0, 1])
    ax.set_xticklabels(ax.get_xticks(), weight='bold')
    ax.set_yticks([0, 1])
    ax.set_yticklabels(ax.get_xticks(), weight='bold')

    ax.set_aspect('equal', 'box')
    ax.set_facecolor('w')
    plt.setp(ax.spines.values(), color='w')
    ax.axhline(0.9, linestyle='-', color='#CCCCCC', lw=1, zorder=0)
    ax.axhline(0.8, linestyle='-', color='#CCCCCC', lw=1, zorder=0)
    ax.axvline(0.9, linestyle='-', color='#CCCCCC', lw=1, zorder=0)
    ax.axvline(0.8, linestyle='-', color='#CCCCCC', lw=1, zorder=0)
    ax.axvline(0.0, linestyle='-', color='k', lw=1, zorder=1)
    ax.axhline(0.0, linestyle='-', color='k', lw=1, zorder=1)

    # plot legend
    ax.legend(
        [(p_mean, p_fill)],
        ['AUC: {:.3f}$\pm${:.3f}'.format(auc_mean, auc_std)],
        facecolor = 'w', 
        prop = {"weight": 'bold', "size": 17},
        bbox_to_anchor = (0.04, 0.04, 0.5, 0.5),
        loc = 'lower left',
    )
    if save_path:
        plt.savefig(save_path, bbox_inches='tight')
        print(f"Plot saved to {save_path}")
    plt.close(ax.figure)

def save_curve_to_csv(curve, curve_info, csv_path):
    # Define the labels based on the curve type
    if curve == 'roc':
        xlabel, ylabel = 'Specificity', 'Sensitivity'
    else:
        xlabel, ylabel = 'Recall', 'Precision'
    
    # Write the curve data to CSV
    with open(csv_path, mode='w', newline='') as csv_file:
        writer = csv.writer(csv_file)
        # define the feature name 
        writer.writerow([xlabel, ylabel, 'Upper', 'Lower', 'AUC Mean', 'AUC Std'])

        xs = curve_info['xs']           
        ys_mean = curve_info['ys_mean']        
        ys_upper = curve_info['ys_upper']      
        ys_lower = curve_info['ys_lower']      
        auc_mean = curve_info['auc_mean']     
        auc_std = curve_info['auc_std']     

        for i in range(len(xs)):
            x_value = xs[i]
            y_mean_value = ys_mean[i]
            y_upper_value = ys_upper[i]
            y_lower_value = ys_lower[i]
            writer.writerow([x_value, y_mean_value, y_upper_value, y_lower_value, auc_mean, auc_std])
    
    print(f"{curve.upper()} data saved to {csv_path}")
